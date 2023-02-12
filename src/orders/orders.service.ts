import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, or } from 'sequelize';
import { Basket } from 'src/basket/basket.model';
import { BasketService } from 'src/basket/basket.service';
import { paginate } from 'src/helpers/paginationHelper';
import { isModelTableFields } from 'src/helpers/sequlizeHelper';
import { isNumber } from 'src/helpers/typesHelper';
import { MailService } from 'src/mail/mail.service';
import { OrderStatus } from 'src/order-status/order-status.model';
import { OrderStatusService } from 'src/order-status/order-status.service';
import { Users } from 'src/users/users.model';
import { UsersService } from 'src/users/users.service';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './orders.model';

interface IFilter {
    id: number,
    userId: number,
    statusId: number,
    customerFio: string,
    customerEmail: string
    customerPhone: string,
}

interface IPaginateResponse {
    count: number,
    rows: Order[]
}

@Injectable()
export class OrdersService {

    constructor(
        @InjectModel(Order) private orderRepo: typeof Order,
        private basketService: BasketService,
        private orderStatusService: OrderStatusService,
        private mailService: MailService,
        private userService: UsersService
    ) { }

    async create(basketHash: string, userId: number) {
        if (!basketHash) {
            throw new HttpException('Не передан хеш код корзины!', HttpStatus.BAD_REQUEST);
        }
        const basket: Basket = await this.basketService.getBasketByHash(basketHash, true);
        const productsNotInStock = await this.basketService.getProductsNotInStock(basket.id);

        if (productsNotInStock) {
            const productsIds = productsNotInStock.map((product) => {
                return product.id;
            });

            await this.basketService.removeProduct(productsIds, basketHash);
        }

        const status = await this.orderStatusService.getStatusByCode("new");
        const amount = await this.basketService.getBasketAmount(basket.id);
        const order = await this.orderRepo.create({ userId, amount, statusId: status.id });
        basket.orderId = order.id;
        basket.save();
        return order;
    }

    async getOrdersWithProducts(page: number, limitPage: number, filter: IFilter, sort: ISort) {
        if (!isNumber(page)) {
            throw new HttpException('Параметр page не был передан', HttpStatus.BAD_REQUEST);
        }
        
        if (!isNumber(limitPage)) {
            throw new HttpException('Параметр limitPage не был передан', HttpStatus.BAD_REQUEST);
        }
        
        let query: any = { include: [
            { model: Users, as: 'customer', where: {} }, 
            { model: Basket, as: 'basket', where: {} },
            { model: OrderStatus, as: 'status', where: {} }
        ], where: {}};

        if(filter.id) {
            query.where.id = filter.id;
        }

        if(filter.userId) {
            query.where.userId = filter.userId;
        }

        if(filter.customerFio) {
            query.include[0].where.fio = { [Op.iLike]: `%${filter.customerFio}%` };
        }

        if(filter.customerPhone) {
            query.include[0].where.phone = filter.customerPhone;
        }

        if(filter.statusId) {
            query.where.statusId = filter.statusId;
        }

        const prepareFind: any = paginate(query, page, limitPage);
        if (sort && sort.sortField && sort.order) {
            const sortArray = [
                sort.sortField,
                sort.order
            ];
            if (isModelTableFields(sort.sortField, Users)) {
                sortArray.unshift("customer");
            }
            prepareFind.order = [sortArray];
        }

        const orders: IPaginateResponse = await this.orderRepo.findAndCountAll(prepareFind);
        if (orders.rows.length <= 0) {
            throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
        }

        if (orders.rows) {
            const basketIds: number[] =  orders.rows.map(order => {
                if (order.basket) {
                    return order.basket.id;
                }
            });

            if (basketIds) {
                const baskets: any = await this.basketService.getByIds(basketIds);
                if (baskets) {
                    orders.rows.map((order, key) => {
                        const basket: Basket = baskets.filter((basket) => {
                            if (basket.orderId === order.id) {
                                return basket;
                            }
                        }
                        );

                        if (basket && basket[0]) {
                            const product = basket[0].dataValues.products;
                            if (product) {
                                orders.rows[key].setDataValue('products', product);
                            }
                        }
                    });
                }
            }
       
            const mapOrders = orders.rows.map((order) => {
                const { id, userId, amount, customer, status } = order;
                const products = order.getDataValue("products");
                const productsMap = products.map((product: any) => {
                    return {
                        id: product.id, 
                        name: product.title, 
                        imageLink: product.image, 
                        price: product.price,
                        quantity: product.BasketProducts.quantity,
                        // remainder: product.quantity
                    }
                });

                return { 
                    id, 
                    userId,
                    customerFio: customer.fio,
                    customerPhone: customer.phone,
                    customerEmail: customer.email,
                    amount,
                    status,
                    products: productsMap
                };
            });

            const lastPage = Math.ceil(orders.count / limitPage) - 1;
            let nextPage = 0;
            if (lastPage > 0) {
                nextPage = page + 1;
            }
    
            return {...orders, rows: mapOrders, nextPage, lastPage};
        }

        throw new HttpException('Заказов не найдено!', HttpStatus.NOT_FOUND);
    }

    async getOrderWithProduct(id: number) {
        const order = await this.orderRepo.findOne({ include: { all: true }, where: { id } });
        const basket: any = await this.basketService.getById(order.basket.id);
        if (basket) {
            order.setDataValue('products', basket.products);
        }
        return order;
    }

    async getOrder(id: number) {
        const order = this.orderRepo.findOne({where: {id}});
        if (!order) {
            throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
        }
        return order;
    }

    async update(updateOrderDto: UpdateOrderDto) {
        const orderId = updateOrderDto.id;
        const statusId = updateOrderDto.statusId;
        
        if (!orderId) {
            throw new HttpException('Не передан айди заказа', HttpStatus.BAD_REQUEST);
        }

        if (!statusId) {
            throw new HttpException('Не передан айди статуса', HttpStatus.BAD_REQUEST);
        }

        const order = await this.getOrder(orderId);
        order.statusId = statusId;
        order.save();

        const userId = order.getDataValue("userId");
        const user = await this.userService.getById(userId);
        const customerEmail = user.email;

        const status = await this.orderStatusService.getStatusById(statusId);
        
        if (!user.isActivatedEmail) {
            throw new HttpException('Email пользователя не подтвержден, уведомление отправить невозможно', HttpStatus.BAD_REQUEST);
        }

        if (status.status === "ready") {
            //отправлять смс клиенту о том что заказ можно забрать
            if (customerEmail && user.isActivatedEmail) {
                this.mailService.sendOrderReadyMail(customerEmail, orderId);
            }
        } else if (status.status === "in_work") {
            //отправлять смс клиенту о том что начали подготовку заказа
            if (customerEmail && user.isActivatedEmail) {
                this.mailService.sendOrderInWorkMail(customerEmail, orderId);
            }
        }

        return true;
    }
}

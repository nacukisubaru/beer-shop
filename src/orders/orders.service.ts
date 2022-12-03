import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BasketProducts } from 'src/basket/basket-products.model';
import { Basket } from 'src/basket/basket.model';
import { BasketService } from 'src/basket/basket.service';
import { defaultLimitPage, paginate } from 'src/helpers/paginationHelper';
import { isModelTableFields } from 'src/helpers/sequlizeHelper';
import { isNumber } from 'src/helpers/typesHelper';
import { Products } from 'src/products/products.model';
import { Users } from 'src/users/users.model';
import { UsersService } from 'src/users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './orders.model';

interface IFilter {
    id: number,
    userId: number,
    customerName: string,
    customerSurname: string
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
        private basketService: BasketService
    ) { }

    async create(basketHash: string, userId: number) {
        if (!basketHash) {
            throw new HttpException('Не передан хеш код корзины!', HttpStatus.BAD_REQUEST);
        }
        const basket: Basket = await this.basketService.getBasketByHash(basketHash);
        const productsNotInStock = await this.basketService.getProductsNotInStock(basket.id);

        if (productsNotInStock) {
            const productsIds = productsNotInStock.map((product) => {
                return product.id;
            });

            await this.basketService.removeProduct(productsIds, basketHash);
        }

        const amount = await this.basketService.getBasketAmount(basket.id);
        const order = await this.orderRepo.create({ userId, isPayed: false, amount });
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
        
        let query: any = { include: [{ model: Users, as: 'customer', where: {} }, { model: Basket, as: 'basket', where: {} }], where: {}};

        if(filter.id) {
            query.where.id = filter.id;
        }

        if(filter.userId) {
            query.where.userId = filter.userId;
        }

        if(filter.customerName) {
            query.include[0].where.name = { [Op.iLike]: `%${filter.customerName}%` };
        }

        if(filter.customerSurname) {
            query.include[0].where.surname = { [Op.iLike]: `%${filter.customerSurname}%` };
        }

        if(filter.customerPhone) {
            query.include[0].where.phone = filter.customerPhone;
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
                const { id, userId, amount, customer } = order;
                const products = order.getDataValue("products");
                const productsMap = products.map((product: any) => {
                    return {
                        id: product.id, 
                        name: product.title, 
                        image: product.image, 
                        price: product.price,
                        quantity: product.BasketProducts.quantity,
                        remainder: product.quantity
                    }
                });

                return { 
                    id, 
                    userId, 
                    customerName: customer.name, 
                    customerSurname: customer.surname, 
                    customerPhone: customer.phone,
                    customerEmail: customer.email,
                    amount: amount,
                    status: "payed",
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

    update(id: number, updateOrderDto: UpdateOrderDto) {
        return `This action updates a #${id} order`;
    }
}

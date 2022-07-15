import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BasketProducts } from 'src/basket/basket-products.model';
import { Basket } from 'src/basket/basket.model';
import { BasketService } from 'src/basket/basket.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './orders.model';

@Injectable()
export class OrdersService {

    constructor(@InjectModel(Order) private orderRepo: typeof Order,
                private basketService: BasketService) {}

    async create(createOrderDto: CreateOrderDto) {
        const order = await this.orderRepo.create(createOrderDto);
        const basket:any = await this.basketService.getById(createOrderDto.basketId);
        basket.orderId = order.id;
        basket.save();
        return order;
    }

    async getOrdersWithProducts(expresion: object = {}) {
        let query: object = { include: { all: true } };
        if (expresion !== {}) {
            query = { include: { all: true }, where: expresion };
        }

        const orders: Order[] = await this.orderRepo.findAll(query);
        if (orders) {
            const ordersIds: number[] = orders.map(order => {
                if (order.basket) {
                    return order.basket.id;
                }
            });

            if (ordersIds) {
                const baskets: any = await this.basketService.getByIds(ordersIds);
                if (baskets) {
                    orders.map((order, key) => {
                        const basket: Basket = baskets.filter((basket) => {
                            if (basket.orderId === order.id) {
                                return basket;
                            }
                        }
                        );

                        if (basket && basket[0]) { 
                            const product = basket[0].dataValues.products;
                            if(product) {
                                orders[key].setDataValue('products', product);
                            }
                        }
                    });
                }
            }

            return orders;
        }

        throw new HttpException('Заказов не найдено!', HttpStatus.NOT_FOUND);
    }

    async getOrderWithProduct(id: number) {
        const order = await this.orderRepo.findOne({include: { all: true }, where: {id}});
        const basket: any = await this.basketService.getById(order.basket.id);
        if(basket) {
            order.setDataValue('products', basket.products);
        }
        return order;
    }

    update(id: number, updateOrderDto: UpdateOrderDto) {
        return `This action updates a #${id} order`;
    }
}

import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Basket } from 'src/basket/basket.model';
import { Users } from 'src/users/users.model';
import { Order } from './orders.model';
import { BasketModule } from 'src/basket/basket.module';
import { TokenModule } from 'src/token/token.module';
import { RolesModule } from 'src/roles/roles.module';
import { OrderStatus } from '../order-status/order-status.model';
import { OrderStatusModule } from 'src/order-status/order-status.module';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    SequelizeModule.forFeature([Basket, Users, Order, OrderStatus]),
    TokenModule,
    BasketModule,
    RolesModule,
    OrderStatusModule
  ]
})
export class OrdersModule {}

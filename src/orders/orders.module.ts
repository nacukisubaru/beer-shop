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

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  imports: [
    SequelizeModule.forFeature([Basket, Users, Order]),
    TokenModule,
    BasketModule,
    RolesModule
  ]
})
export class OrdersModule {}

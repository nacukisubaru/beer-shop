import { Module } from '@nestjs/common';
import { BasketService } from './basket.service';
import { BasketController } from './basket.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Basket } from './basket.model';
import { Users } from 'src/users/users.model';
import { Products } from 'src/products/products.model';
import { BasketProducts } from './basket-products.model';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import { ProductsModule } from 'src/products/products.module';

@Module({
    controllers: [BasketController],
    providers: [BasketService],
    imports: [
        SequelizeModule.forFeature([Basket, Users, Products, BasketProducts]),
        TokenModule,
        ProductsModule
    ],
    exports: [
        BasketService
    ]
})
export class BasketModule { }

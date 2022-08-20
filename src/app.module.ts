import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductsModule } from './products/products.module';
import { BeersService } from './beers/beers.service';
import { BeersModule } from './beers/beers.module';
import { Products } from './products/products.model';
import { Beers } from './beers/beers.model';
import { GradesController } from './grades/grades.controller';
import { GradesModule } from './grades/grades.module';
import { Grades } from './grades/grades.model';
import { BeerGrades } from './grades/beers-grades.model';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { BasketModule } from './basket/basket.module';
import { BasketProducts } from './basket/basket-products.model';
import { Basket } from './basket/basket.model';
import { Users } from './users/users.model';
import { OrdersModule } from './orders/orders.module';
import { DeliveryModule } from './delivery/delivery.module';
import { Delivery } from './delivery/delivery.model';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { PaymentMethod } from './payment-methods/payment-methods.model';
import { BrandsModule } from './brands/brands.module';
import { Brand } from './brands/brands.model';
import { SnacksModule } from './snacks/snacks.module';
import { Snack } from './snacks/snacks.model';
import { TokenModule } from './token/token.module';
import { Token } from './token/token.model';
import { MailModule } from './mail/mail.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProductTypesModule } from './product-types/product-types.module';
import { ProductTypes } from './product-types/product-type.model';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.${process.env.NODE_ENV}.env`
        }),
        SequelizeModule.forRoot({
            dialect: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: Number(process.env.POSTGRES_PORT),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            models: [
                Products,
                Beers,
                Grades,
                BeerGrades, 
                BasketProducts, 
                Basket,
                Users, 
                Delivery, 
                ProductTypes, PaymentMethod, Brand, Snack, Token],
            autoLoadModels: true
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, 'static'),
        }),
        ProductsModule,
        BeersModule,
        GradesModule,
        UsersModule,
        BasketModule,
        OrdersModule,
        DeliveryModule,
        PaymentMethodsModule,
        BrandsModule,
        SnacksModule,
        TokenModule,
        MailModule,
        FilesModule,
        ProductTypesModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }

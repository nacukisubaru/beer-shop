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
                BeerGrades, BasketProducts, Basket, Users],
            autoLoadModels: true
        }),
        ProductsModule,
        BeersModule,
        GradesModule,
        UsersModule,
        BasketModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProductsModule } from './products/products.module';
import { BeersService } from './beers/beers.service';
import { BeersModule } from './beers/beers.module';
import { Products } from './products/products.model';
import { Beers } from './beers/beers.model';

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
            models: [Products, Beers],
            autoLoadModels: true
		  }),
        ProductsModule,
        BeersModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }

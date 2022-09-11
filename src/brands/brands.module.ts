import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Brand } from './brands.model';
import { ProductTypesModule } from 'src/product-types/product-types.module';
import { ProductTypes } from 'src/product-types/product-type.model';

@Module({
    controllers: [BrandsController],
    providers: [BrandsService],
    imports: [
        SequelizeModule.forFeature([Brand, ProductTypes]),
        ProductTypesModule
    ],
    exports: [
        BrandsService
    ]
})
export class BrandsModule { }

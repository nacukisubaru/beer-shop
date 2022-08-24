import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Products } from './products.model';
import { Basket } from 'src/basket/basket.model';
import { BasketProducts } from 'src/basket/basket-products.model';
import { BrandsModule } from 'src/brands/brands.module';
import { FilesModule } from 'src/files/files.module';
import { TypePackagingModule } from 'src/type-packaging/type-packaging.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    SequelizeModule.forFeature([Products, Basket, BasketProducts]),
    BrandsModule,
    FilesModule,
    TypePackagingModule
  ],
  exports:[ProductsService]
})
export class ProductsModule {}

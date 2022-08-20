import { Module } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';
import { ProductTypes } from './product-type.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  controllers: [ProductTypesController],
  providers: [ProductTypesService],
  imports: [
    SequelizeModule.forFeature([ProductTypes]),
  ],
  exports: [
    ProductTypesService
  ]
})
export class ProductTypesModule {}

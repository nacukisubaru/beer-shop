import { Module } from '@nestjs/common';
import { ProductTypesService } from './product-types.service';
import { ProductTypesController } from './product-types.controller';
import { ProductTypes } from './product-type.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { TokenModule } from 'src/token/token.module';

@Module({
  controllers: [ProductTypesController],
  providers: [ProductTypesService],
  imports: [
    SequelizeModule.forFeature([ProductTypes]),
    TokenModule
  ],
  exports: [
    ProductTypesService
  ]
})
export class ProductTypesModule {}

import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Products } from './products.model';
import { BeersModule } from 'src/beers/beers.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  imports: [
    SequelizeModule.forFeature([Products]),
    BeersModule
  ],
  exports:[ProductsService]
})
export class ProductsModule {}

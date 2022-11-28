import { Module } from '@nestjs/common';
import { TypePackagingService } from './type-packaging.service';
import { TypePackagingController } from './type-packaging.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { TypePackaging } from './type-packaging.model';
import { ProductTypesModule } from 'src/product-types/product-types.module';
import { TokenModule } from 'src/token/token.module';

@Module({
  controllers: [TypePackagingController],
  providers: [TypePackagingService],
  imports: [
    SequelizeModule.forFeature([TypePackaging]),
    ProductTypesModule,
    TokenModule
  ],
  exports: [TypePackagingService]
})
export class TypePackagingModule {}

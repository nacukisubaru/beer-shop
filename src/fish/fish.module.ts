import { forwardRef, Module } from '@nestjs/common';
import { FishService } from './fish.service';
import { FishController } from './fish.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { FishType } from 'src/fish-types/fish-types.model';
import { Fish } from './fish.model';
import { ProductsModule } from 'src/products/products.module';
import { Products } from 'src/products/products.model';
import { RolesModule } from 'src/roles/roles.module';
import { TokenModule } from 'src/token/token.module';
import { FishTypesModule } from 'src/fish-types/fish-types.module';
import { FishTypesService } from 'src/fish-types/fish-types.service';

@Module({
  controllers: [FishController],
  providers: [FishService],
  imports: [
    SequelizeModule.forFeature([Fish, FishType, Products]),
    ProductsModule,
    RolesModule,
    TokenModule,
    FishTypesModule
  ],
  exports: [FishService]
})
export class FishModule {}

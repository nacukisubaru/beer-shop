import { Module } from '@nestjs/common';
import { SnacksService } from './snacks.service';
import { SnacksController } from './snacks.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Snack } from './snacks.model';
import { ProductsModule } from 'src/products/products.module';

@Module({
    controllers: [SnacksController],
    providers: [SnacksService],
    imports: [
        SequelizeModule.forFeature([Snack]),
        ProductsModule
    ]
})
export class SnacksModule { }

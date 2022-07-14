import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Delivery } from './delivery.model';

@Module({
    controllers: [DeliveryController],
    providers: [DeliveryService],
    imports: [
        SequelizeModule.forFeature([Delivery])
    ]
})
export class DeliveryModule { }

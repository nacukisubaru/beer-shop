import { Module } from '@nestjs/common';
import { OrderStatusService } from './order-status.service';
import { OrderStatusController } from './order-status.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderStatus } from './order-status.model';

@Module({
    controllers: [OrderStatusController],
    providers: [OrderStatusService],
    imports: [
        SequelizeModule.forFeature([OrderStatus])
    ],
    exports: [
        OrderStatusService
    ]
})
export class OrderStatusModule { }

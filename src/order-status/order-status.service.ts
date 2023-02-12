import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrderStatus } from './order-status.model';

@Injectable()
export class OrderStatusService {
    constructor(
        @InjectModel(OrderStatus) private orderStatusRepo: typeof OrderStatus,
    ) {}
    
    async getStatusesList() {
       return this.orderStatusRepo.findAll();
    }

    async getStatusById(id: number) {
        const status = await this.orderStatusRepo.findOne({where: {id}});
        if (!status) {
            throw new HttpException('Статус не найден', HttpStatus.NOT_FOUND);
        }

        return status;
    }
}
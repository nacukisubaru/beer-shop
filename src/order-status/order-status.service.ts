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
        if (!id) {
            throw new HttpException('Id не передан', HttpStatus.BAD_REQUEST);
        }

        const status = await this.orderStatusRepo.findOne({where: {id}});
        if (!status) {
            throw new HttpException('Статус не найден', HttpStatus.NOT_FOUND);
        }

        return status;
    }

    async getStatusByCode(code: string) {
        if (!code) {
            throw new HttpException('Код статуса не передан', HttpStatus.BAD_REQUEST);
        }

        const status = await this.orderStatusRepo.findOne({where: {status: code}});
        if (!status) {
            throw new HttpException('Статус не найден', HttpStatus.NOT_FOUND);
        }

        return status;
    }
}
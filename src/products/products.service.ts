import { Injectable } from '@nestjs/common';
import { Products } from './products.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(Products) private productRepo: typeof Products) {}

    async getAll() {
      return await this.productRepo.findAll({include: {all:true}});
    }
}

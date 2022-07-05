import { Injectable } from '@nestjs/common';
import { Products } from './products.model';
import { InjectModel } from '@nestjs/sequelize';
import { BeersService } from 'src/beers/beers.service';
import { Beers } from 'src/beers/beers.model';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(Products) private productRepo: typeof Products) {}

    async getAll() {
      const product: any = await this.productRepo.findAll({include: {all:true}});
      return product;
    }

    async create(dto: CreateProductDto) {
        return await this.productRepo.create(dto);
    }
}

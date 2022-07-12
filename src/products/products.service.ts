import { Injectable } from '@nestjs/common';
import { Products } from './products.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Grades } from 'src/grades/grades.model';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(Products) private productRepo: typeof Products) {}

    async create(dto: CreateProductDto) {
        return await this.productRepo.create(dto);
    }

    async update(id: number, dto: UpdateProductDto) {
        return await this.productRepo.update({...dto}, {where: {id}})
    }
    
    async remove(id): Promise<Number> {
        return await this.productRepo.destroy({where:{id}});
    }

    async switchActive(id: number, isActive: boolean): Promise<Object> {
        return await this.productRepo.update({isActive}, {where:{id}});
    }

    async getById(id): Promise<Products> {
        return await this.productRepo.findByPk(id, { include: { all: true } });
    }

    async getAll(): Promise<Products[]> {
        const product: any = await this.productRepo.findAll({include: {all:true}});
        return product;
    }
  
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Products } from './products.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Grades } from 'src/grades/grades.model';
import { BrandsService } from 'src/brands/brands.service';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(Products) private productRepo: typeof Products,
                private brandService: BrandsService) {}

    async create(dto: CreateProductDto) {
        const brand = await this.brandService.getById(dto.brandId);
        if(!brand) {
            throw new HttpException('Бренд не был найден', HttpStatus.BAD_REQUEST);
        }

        const product = await this.productRepo.create(dto);
        product.$set('brand', brand.id);
        return product;
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
  
    async getListByBrand(brandId: number) {
       return await this.productRepo.findAll({include: {all:true}, where: {brandId}});
    }
}

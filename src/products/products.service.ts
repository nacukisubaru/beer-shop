import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Products } from './products.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Grades } from 'src/grades/grades.model';
import { BrandsService } from 'src/brands/brands.service';
import { FilesService } from 'src/files/filtes.service';
import { Op } from 'sequelize';
import sequelize from 'sequelize';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(Products) private productRepo: typeof Products,
                private brandService: BrandsService,
                private fileService: FilesService) {}

    async create(dto: CreateProductDto, image:any) {
        const brand = await this.brandService.getById(dto.brandId);
        if(!brand) {
            throw new HttpException('Бренд не был найден', HttpStatus.BAD_REQUEST);
        }

        const fileName = await this.fileService.createFile(image, 'products');
        
        const product = await this.productRepo.create({...dto, image: fileName});
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

    async getListByFilter(ids: number[], brandIds:number[] = [], minPrice: number = 0, maxPrice: number = 0) {
        const queryFilter: any = {
            include: {all:true}, 
            where: {}
        };

        if(ids.length > 0) {
            queryFilter.where.id = {[Op.or]: ids};
        }

        if(brandIds.length > 0) {
            queryFilter.where.brandId = {[Op.or]: brandIds};
        }

        if(minPrice && maxPrice) {
            queryFilter.where.price = {
                [Op.gt]: minPrice, 
                [Op.lt]: maxPrice
            };
        }

        if(queryFilter.where === {}) {
            throw new HttpException('Не передан не один параметр для фильтрации', HttpStatus.BAD_REQUEST);
        }

        return await this.productRepo.findAll(queryFilter);
    }

    async getMinAndMaxPrice() {
        return await this.productRepo.findAll({
            attributes: [[sequelize.fn('min', sequelize.col('price')), 'minPrice'], [sequelize.fn('max', sequelize.col('price')), 'maxPrice']],
        });
    }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Products } from './products.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Grades } from 'src/grades/grades.model';
import { BrandsService } from 'src/brands/brands.service';
import { FilesService } from 'src/files/filtes.service';
import { Op, where } from 'sequelize';
import sequelize from 'sequelize';
import { getMinMaxQuery } from 'src/helpers/sequlizeHelper';
import { TypePackagingService } from 'src/type-packaging/type-packaging.service';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(Products) private productRepo: typeof Products,
                private brandService: BrandsService,
                private fileService: FilesService,
                private typePackagingService: TypePackagingService) {}

    async create(dto: CreateProductDto, image:any) {
        const brand = await this.brandService.getById(dto.brandId);
        if(!brand) {
            throw new HttpException('Бренд не был найден', HttpStatus.BAD_REQUEST);
        }
        
        const typePackaging = await this.typePackagingService.getById(dto.typePackagingId);
        if(!typePackaging) {
            throw new HttpException('Тип упаковки не был найден', HttpStatus.BAD_REQUEST);
        }

        const fileName = await this.fileService.createFile(image, 'products');
        const product = await this.productRepo.create({...dto, image: fileName});
        
        product.brandName = brand.name;
        product.typePackagingName = typePackaging.name;
        product.save();
        return product;
    }

    async getListByFilter(brandIds:number[] = [], typesPackagingIds: number[] = [], minPrice: number = 0, maxPrice: number = 0) {
        const queryFilter: any = {
            include: {all:true}, 
            where: {}
        };

        if(brandIds.length > 0) {
            queryFilter.where.brandId = {[Op.or]: brandIds};
        }

        if(minPrice && maxPrice && minPrice > 0 && maxPrice > 0) {
            queryFilter.where.price = {
                [Op.gte]: minPrice, 
                [Op.lte]: maxPrice
            };
        }

        if(typesPackagingIds.length > 0) {
            queryFilter.where.typePackagingId = {[Op.or]: typesPackagingIds};
        }

        return await this.productRepo.findAll(queryFilter);
    }

    async getMinAndMaxPrice(productType: string = "beers") {
        let where = {};
        if(productType === "beers") {
            where = {
                beerId: {
                    [Op.ne]: null
                }
            };
        } else if (productType === "snacks") {
            where = {
                snackId: {
                    [Op.ne]: null
                }
            };
        }

        const query: any[] = getMinMaxQuery({colMin:'price', colMax: 'price', minOutput: 'minPrice', maxOutput: 'maxPrice'}); 
        return await this.productRepo.findAll({
            attributes: query,
            where
        });
    }

    async searchByTitleAndDesc(q: string) {
        const products = await this.productRepo.findAll({
            where: {
                [Op.or] : [
                    {title: {[Op.iLike]: `%${q}%`}}, 
                    {description: {[Op.iLike]: `%${q}%`}}
                ]
            }
        });
        return products.map((product) => {
           return product.id;
        });
    }

    async getProductsByStock(productsIds: number[] | number, inStock: boolean = true) {
        const query: any = {where:{id: productsIds, inStock: inStock, isActive: true}, include:{all:true}};
        if(Array.isArray(productsIds)) {
            query.where.id = {[Op.or]: productsIds};
        }

        return await this.productRepo.findAll(query);
    }

    async addShow(id: number) {
        const product = await this.getById(id);
        if(!product) {
             throw new HttpException('Товар не найден', HttpStatus.BAD_REQUEST);
        }
 
        return this.productRepo.update({show: product.show + 1}, {where: {id}});
    }

    buildFilterByProductFields(
        filterObj:any,
        brandIds: number[] = [], 
        typesPackagingIds: number[] = [], 
        minPrice: number = 0, maxPrice: number = 0) {

        if(brandIds.length > 0) {
            filterObj.brandId = {[Op.or]: brandIds};
        }

        if(minPrice && maxPrice && minPrice > 0 && maxPrice > 0) {
            filterObj.price = {
                [Op.gte]: minPrice, 
                [Op.lte]: maxPrice
            };
        }

        if(typesPackagingIds.length > 0) {
            filterObj.typePackagingId = {[Op.or]: typesPackagingIds};
        }

        return filterObj;
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

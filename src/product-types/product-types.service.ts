import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateProductTypeDto } from './dto/create-product-type.dto';
import { UpdateProductTypeDto } from './dto/update-product-type.dto';
import { ProductTypes } from './product-type.model';

@Injectable()
export class ProductTypesService {

    constructor(@InjectModel(ProductTypes) private productTypesRepo: typeof ProductTypes) {    
    }

    async getByCode(code: string) {
       return await this.productTypesRepo.findOne({where:{code}});
    }

    create(createProductTypeDto: CreateProductTypeDto) {
        return 'This action adds a new productType';
    }

    async findAll() {
        return await this.productTypesRepo.findAll();
    }

    findOne(id: number) {
        return `This action returns a #${id} productType`;
    }

    update(id: number, updateProductTypeDto: UpdateProductTypeDto) {
        return `This action updates a #${id} productType`;
    }

    remove(id: number) {
        return `This action removes a #${id} productType`;
    }
}

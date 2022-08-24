import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductTypesService } from 'src/product-types/product-types.service';
import { CreateTypePackagingDto } from './dto/create-type-packaging.dto';
import { UpdateTypePackagingDto } from './dto/update-type-packaging.dto';
import { TypePackaging } from './type-packaging.model';

@Injectable()
export class TypePackagingService {
    constructor(@InjectModel(TypePackaging) private typePackagingRepo: typeof TypePackaging,
                private productTypeService: ProductTypesService) {}
    
    async create(createTypePackagingDto: CreateTypePackagingDto) {
        return await this.typePackagingRepo.create(createTypePackagingDto);
    }

    async getListByProductType(productType: string) {
        const prodType = await this.productTypeService.getByCode(productType);
        return await this.typePackagingRepo.findAll({where:{productTypeId: prodType.id}})
    }

    async getById(id) {
       return await this.typePackagingRepo.findOne({where:{id}});
    }
}

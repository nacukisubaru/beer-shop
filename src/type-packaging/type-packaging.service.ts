import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { defaultLimitPage, paginate } from 'src/helpers/paginationHelper';
import { ProductTypesService } from 'src/product-types/product-types.service';
import { CreateTypePackagingDto } from './dto/create-type-packaging.dto';
import { UpdateTypePackagingDto } from './dto/update-type-packaging.dto';
import { TypePackaging } from './type-packaging.model';
import { isNumber } from 'src/helpers/typesHelper';
import { Op } from 'sequelize';
interface IFilter {
    id: number,
    name: string,
    productTypeId: number
}
@Injectable()
export class TypePackagingService {
    constructor(@InjectModel(TypePackaging) private typePackagingRepo: typeof TypePackaging,
                private productTypeService: ProductTypesService) {}
    
    async create(createTypePackagingDto: CreateTypePackagingDto) {
        return await this.typePackagingRepo.create(createTypePackagingDto);
    }

    async getListByProductType(productType: string) {
        const prodType = await this.productTypeService.getByCode(productType);
        if(!prodType) {
            throw new HttpException('Тип продукта не найден', HttpStatus.NOT_FOUND);
        }
        return await this.typePackagingRepo.findAll({where:{productTypeId: prodType.id}})
    }

    async getById(id) {
       return await this.typePackagingRepo.findOne({include:{all: true}, where: {id}});
    }

    async getList(page: number, limitPage: number = defaultLimitPage, filter: IFilter, sort?: ISort) {
        if (!isNumber(page)) {
            throw new HttpException('Параметр page не был передан', HttpStatus.BAD_REQUEST);
        }
        
        if (!isNumber(limitPage)) {
            throw new HttpException('Параметр limitPage не был передан', HttpStatus.BAD_REQUEST);
        }
      
        const prepareFilter: any = {include:{all:true}, where: {}};

        if(filter.name) {
            prepareFilter.where.name = { [Op.iLike]: `%${filter.name}%` };
        }

        if(filter.id) {
            prepareFilter.where.id = filter.id;
        }

        if(filter.productTypeId) {
            prepareFilter.where.productTypeId = filter.productTypeId;
        }        
        const count = await TypePackaging.count();
        const query: any = paginate(prepareFilter, page, limitPage);
        if (sort && sort.sortField && sort.order) {
            const sortArray = [
                sort.sortField,
                sort.order
            ];
            query.order = [sortArray];
        }
    
        const data = await this.typePackagingRepo.findAndCountAll(query);
        if (!data.rows || data.rows.length <= 0) {
            throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
        }
        data.count = count;
        const lastPage = Math.ceil(data.count / limitPage) - 1;
        let nextPage = 0;
        if (lastPage > 0) {
            nextPage = page + 1;
        }

        return { ...data, nextPage, lastPage };
    }


    async update(id: number, updateBrandDto: UpdateTypePackagingDto) {
        const type = await this.getById(id);
        const productTypeId = type.getDataValue("productTypeId")
        const products = type.products;
        if(products.length && updateBrandDto.productTypeId != productTypeId) {
            throw new HttpException(`У данного типа упаковки есть привязки к товарам с этими идентификаторами(id) 
            ${products.map((product) => product.getDataValue("id")).toString()} нужно отвязать после можно изменить тип товара у типа упаковки`, HttpStatus.BAD_REQUEST)
        }
        
        return await this.typePackagingRepo.update(updateBrandDto, {where: {id}});
    }

    async remove(id: number) {
        const brand = await this.getById(id);
        const products = brand.products;
        if(products.length) {
            throw new HttpException(`У данного типа упаковки есть привязки к товарам с этими идентификаторами(id) 
            ${products.map((product) => product.getDataValue("id")).toString()} нужно отвязать после удалить тип упаковки`, HttpStatus.BAD_REQUEST)
        }
        
        return await this.typePackagingRepo.destroy({where:{id}});
    }
}


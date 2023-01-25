import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { defaultLimitPage, paginate } from 'src/helpers/paginationHelper';
import { isNumber } from 'src/helpers/typesHelper';
import { ProductTypesService } from 'src/product-types/product-types.service';
import { Brand } from './brands.model';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
interface IFilter {
    id: number,
    name: string,
    productTypeId: number
}
@Injectable()
export class BrandsService {

    constructor(
        @InjectModel(Brand) private brandRepo: typeof Brand,
        private productTypeService: ProductTypesService,
    ) {}

    async create(createBrandDto: CreateBrandDto) {
        return await this.brandRepo.create(createBrandDto);
    }

    async getById(id: number) {
        return await this.brandRepo.findOne({include:{all: true}, where: {id}});
    }

    async getByProductType(type: string) {
        const prodType = await this.productTypeService.getByCode(type);
        if(!prodType) {
            throw new HttpException('Тип продукта не найден', HttpStatus.NOT_FOUND);
        }
        return await this.brandRepo.findAll({where:{productTypeId: prodType.id}})
    }

    async findAll() {
        return await this.brandRepo.findAll();
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
        const count = await Brand.count();
        const query: any = paginate(prepareFilter, page, limitPage);
        if (sort && sort.sortField && sort.order) {
            const sortArray = [
                sort.sortField,
                sort.order
            ];
            query.order = [sortArray];
        }
    
        const data = await this.brandRepo.findAndCountAll(query);
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

    async findOne(id: number) {
        return await this.brandRepo.findByPk(id);
    }

    async update(id: number, updateBrandDto: UpdateBrandDto) {
        const brand = await this.getById(id);
        const productTypeId = brand.getDataValue("productTypeId")
        const products = brand.products;
        if(products.length && updateBrandDto.productTypeId != productTypeId) {
            throw new HttpException(`У данного бренда есть привязки к товарам с этими идентификаторами(id) 
            ${products.map((product) => product.getDataValue("id")).toString()} нужно отвязать после можно изменить тип товара у бренда`, HttpStatus.BAD_REQUEST)
        }
        
        return await this.brandRepo.update(updateBrandDto, {where: {id}});
    }

    async remove(id: number) {
        const brand = await this.getById(id);
        const products = brand.products;
        if(products.length) {
            throw new HttpException(`У данного бренда есть привязки к товарам с этими идентификаторами(id) 
            ${products.map((product) => product.getDataValue("id")).toString()} нужно отвязать после удалить бренд`, HttpStatus.BAD_REQUEST)
        }
        
        return await this.brandRepo.destroy({where:{id}});
    }
}

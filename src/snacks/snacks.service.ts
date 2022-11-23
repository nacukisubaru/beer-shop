import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { isEmptyObject, isNumber } from 'src/helpers/typesHelper';
import { paginate } from 'src/helpers/paginationHelper';
import { ProductsService } from 'src/products/products.service';
import { CreateSnackDto } from './dto/create-snack.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';
import { Snack } from './snacks.model';
import { Products } from 'src/products/products.model';
import { Op } from 'sequelize';
interface ISnackFilter {
    id: number, 
    brandIds: number[], 
    typesPackagingIds: number[], 
    minPrice: number, 
    maxPrice: number, 
    sort: [string, string], 
    page: number, limitPage: number
}
@Injectable()
export class SnacksService {
    constructor(@InjectModel(Snack) private snackRepo: typeof Snack,
        private productService: ProductsService) { }


    async create(createSnackDto: CreateSnackDto, image: BinaryData) {
        const productData = {
            title: createSnackDto.title,
            description: createSnackDto.description,
            price: createSnackDto.price,
            quantity: createSnackDto.quantity,
            brandId: createSnackDto.brandId,
            typePackagingId: createSnackDto.typePackagingId,
            isActive: createSnackDto.isActive === 'true' ? true : false
        };

        const product = await this.productService.create(productData, image);
        const snack = await this.snackRepo.create({ weight: createSnackDto.weight });

        snack.productId = product.id;
        product.snackId = snack.id;
        product.save();
        snack.save();
        return snack;
    }

    async getList(page: number, limitPage: number = 0, filter: object = {}, sort: [string, string] = ['price', 'ASC']) {
        if (isNumber(page)) {
            if (isEmptyObject(filter)) {
                filter = { include: {
                     all: true, 
                 } };
            }

            const query:any = paginate(filter, page, limitPage);
            query.order = [[
                "product",
                ...sort
            ]]; //сортировка по полю из связной таблицы
        
            const snackList = await this.snackRepo.findAndCountAll(query);
            
            if (snackList.rows.length <= 0) {
                throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
            }

            return { ...snackList, nextPage: page + 1 };
        }

        throw new HttpException('Параметр page не был передан', HttpStatus.BAD_REQUEST);
    }

    async getById(id: number) {
        return await this.snackRepo.findByPk(id, { include: { all: true } });
    }

    async update(id: number, updateSnackDto: UpdateSnackDto, image: BinaryData) {
        const prodData = {
            title: updateSnackDto.title,
            description: updateSnackDto.description,
            price: updateSnackDto.price,
            quantity: updateSnackDto.quantity,
            brandId: updateSnackDto.brandId,
            typePackagingId: updateSnackDto.typePackagingId,
            isActive: updateSnackDto.isActive === 'true' ? true : false,
        };

        const snack = await this.snackRepo.findByPk(id);
        if (!snack) {
            throw new HttpException("Товар не найден!", HttpStatus.BAD_REQUEST);
        }

        const productId = snack.productId;
        await this.productService.update(productId, prodData, image);
        if (this.snackRepo.update({ ...snack, weight: updateSnackDto.weight }, { where: { id } })) {
            return true;
        }

        return false;
    }

    async getListByFilter(filter: ISnackFilter) {
        const queryFilter: any = {
            include: {
                model: Products, as: 'product',
                where: {
                    isActive: true
                }
            },
            where: {}
        };
        const {
            id = 0, 
            brandIds = [], 
            typesPackagingIds = [], 
            minPrice = 0, 
            maxPrice = 0, 
            sort = ['price', 'ASC'], 
            page, limitPage 
        } = filter
       
        queryFilter.include.where = this.productService.buildFilterByProductFields(queryFilter.include.where, {
            id,
            brandIds, 
            typesPackagingIds, 
            minPrice, 
            maxPrice,
        });

        const snacks = await this.getList(page, limitPage, queryFilter, sort);
        return snacks;
    }

    async searchByName(q: string, page: number, limitPage: number = 0, sort:[string, string] = ['price', 'ASC']) {
        const query = {
            include: {
                model: Products, as: 'product',
                where: {
                    isActive: true,
                    [Op.or] : [
                        {title: {[Op.iLike]: `%${q}%`}}, 
                        {description: {[Op.iLike]: `%${q}%`}}
                    ]
                }
            }
        };
        return await this.getList(page, limitPage, query, sort);
    }
}
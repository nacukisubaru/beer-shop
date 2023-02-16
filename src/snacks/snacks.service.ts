import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { isEmptyObject, isNumber } from 'src/helpers/typesHelper';
import { defaultLimitPage, paginate } from 'src/helpers/paginationHelper';
import { ProductsService } from 'src/products/products.service';
import { CreateSnackDto } from './dto/create-snack.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';
import { Snack } from './snacks.model';
import { Products } from 'src/products/products.model';
import { Op } from 'sequelize';

@Injectable()
export class SnacksService {
    constructor(@InjectModel(Snack) private snackRepo: typeof Snack,
        private productService: ProductsService) { }


    async create(createSnackDto: CreateSnackDto, image: BinaryData) {
        const productData = {
            title: createSnackDto.title,
            description: createSnackDto.description,
            price: Number(createSnackDto.price),
            quantity: Number(createSnackDto.quantity),
            brandId: Number(createSnackDto.brandId),
            typePackagingId: Number(createSnackDto.typePackagingId),
            isActive: createSnackDto.isActive === 'true' ? true : false,
            inStock: createSnackDto.inStock === 'true' ? true : false,
            isPromote: createSnackDto.isPromote === 'true' ? true : false,
        };

        const productNameExist = await this.productService.getByTitle(createSnackDto.title);
        if(productNameExist) {
            throw new HttpException('Товар с данным именем уже существует', HttpStatus.BAD_REQUEST);
        }

        try {
            const product = await this.productService.create(productData, image);
            const snack = await this.snackRepo.create({ weight: createSnackDto.weight });

            snack.productId = product.id;
            product.snackId = snack.id;
            product.save();
            snack.save();
            return snack;
        }  catch (e) {
            return e;
        }
    }

    async update(id: number, updateSnackDto: UpdateSnackDto, image: BinaryData) {
        const prodData = {
            title: updateSnackDto.title,
            description: updateSnackDto.description,
            price: Number(updateSnackDto.price),
            quantity: Number(updateSnackDto.quantity),
            brandId: Number(updateSnackDto.brandId),
            typePackagingId: Number(updateSnackDto.typePackagingId),
            isActive: updateSnackDto.isActive === 'true' ? true : false,
            inStock: updateSnackDto.inStock === 'true' ? true : false,
            isPromote: updateSnackDto.isPromote === 'true' ? true : false,
        };

        if(!isNumber(id)) {
            throw new HttpException('Параметр id не является строкой', HttpStatus.BAD_REQUEST);
        }

        const snack = await this.getByProductId(id);
        if (!snack) {
            throw new HttpException("Товар не найден!", HttpStatus.BAD_REQUEST);
        }
        
        const productNameExist = await this.productService.getByTitle(updateSnackDto.title);
        if(productNameExist && updateSnackDto.title !== snack.product.title) {
            throw new HttpException('Товар с данным именем уже существует', HttpStatus.BAD_REQUEST);
        }

        const productId = snack.productId;
        await this.productService.update(productId, prodData, image);
        if (this.snackRepo.update({ ...snack, weight: updateSnackDto.weight }, { where: { productId: id } })) {
            return true;
        }

        return false;
    }

    async getList(page: number, limitPage: number = defaultLimitPage, filter: object = {}, sort: ISort = {sortField: 'price', order: 'ASC'}) {
        if (isNumber(page) && isNumber(limitPage)) {
            if (isEmptyObject(filter)) {
                filter = { include: {
                     all: true, 
                 } };
            }


            const query:any = paginate(filter, page, limitPage);
            // if(sort.sortField && sort.order) {
            //     query.order = [[
            //         "product",
            //         ...sort
            //     ]]; //сортировка по полю из связной таблицы
            // }
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

    async getListByFilter(filter: IProductFilter, sort: ISort, page: number, limitPage: number) {
        const queryFilter: any = {
            include: {
                model: Products, as: 'product',
                where: {}
            },
            where: {}
        };
        
        const findQuery = (query) => {return this.findAndCountAll(query)};
        queryFilter.include.where = this.productService.buildFilterByProductFields(queryFilter.include.where, filter);
        return this.productService.getList(page, limitPage, queryFilter, findQuery, sort);
    }

    async getByProductId(id: number): Promise<Snack> {
        const res = await this.snackRepo.findOne({
            include: {
                all: true,
                nested: true
            },
            where: { productId: id }
        });
        return res;
    }

    findAndCountAll(query) {
        return this.snackRepo.findAndCountAll(query);
    }
}
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Model, Op } from 'sequelize';
import { GradesService } from 'src/grades/grades.service';
import { paginate, defaultLimitPage } from 'src/helpers/paginationHelper';
import { getMinMaxQuery } from 'src/helpers/sequlizeHelper';
import { isEmptyObject, isNumber } from 'src/helpers/typesHelper';
import { Products } from 'src/products/products.model';
import { ProductsService } from 'src/products/products.service';
import { Beers } from './beers.model';
import { CreateBeerDto } from './dto/create-beer.dto';
import { UpdateBeerDto } from './dto/update-beer.dto';
interface IVolume {
    minVolume: number,
    maxVolume: number
}
interface IFortress {
    minFortress: number,
    maxFortress: number,
}
interface ISort {
    sortField: string,
    order: string
}
interface IBeerFilter {
    id?: number,
    title?: string,
    description?: string,
    grades?: number[],
    brandIds?: number[],
    typesPackagingIds?: number[],
    minPrice?: number,
    maxPrice?: number,
    volume?: IVolume,
    fortress?: IFortress,
    forBottling?: any,
    filtered?: any
    isActive?: string,
    sort?: ISort,
    compound?: string,
    inStock?: boolean,
    page?: number, limitPage?: number
}
@Injectable()
export class BeersService {

    constructor(@InjectModel(Beers) private beerRepo: typeof Beers,
        private productService: ProductsService,
        private gradeService: GradesService) { }

    async create(dto: CreateBeerDto, image: any) {
        const productData = {
            title: dto.title,
            description: dto.description,
            price: Number(dto.price),
            quantity: Number(dto.quantity),
            brandId: Number(dto.brandId),
            typePackagingId: Number(dto.typePackagingId),
            isActive: dto.isActive === 'true' ? true : false,
            inStock: dto.inStock === 'true' ? true : false
        };

        const beerData = {
            compound: dto.compound,
            volume: Number(dto.volume),
            fortress: Number(dto.fortress),
            ibu: Number(dto.ibu),
            forBottling: dto.forBottling === 'true' ? true : false,
            filtered: dto.filtered === 'true' ? true : false 
        };

        if(this.productService.getByTitle(dto.title)) {
            throw new HttpException('Товар с данным именем уже существует', HttpStatus.BAD_REQUEST);
        }

        const grades = await this.gradeService.findByIds(dto.gradeIds);
        if (grades.length !== dto.gradeIds.length) {
            throw new HttpException('Сорт пива не был найден', HttpStatus.BAD_REQUEST);
        }

        try {
            const product = await this.productService.create(productData, image);
            const beer = await this.beerRepo.create(beerData);

            beer.$set('grades', dto.gradeIds);
            beer.productId = product.id;
            product.beerId = beer.id;
            product.save();
            beer.save();
            return beer;
        } catch (e) {
            return e;
        }
    }

    async update(id: number, dto: UpdateBeerDto, image: BinaryData) {

        const prodData = {
            title: dto.title,
            description: dto.description,
            price: Number(dto.price),
            quantity: Number(dto.quantity),
            typePackagingId: Number(dto.typePackagingId),
            brandId: Number(dto.brandId),
            isActive: dto.isActive === 'true' ? true : false,
            inStock: dto.inStock === 'true' ? true : false,
        };

        const beerData = {
            compound: dto.compound,
            volume: Number(dto.volume),
            fortress: Number(dto.fortress),
            ibu: Number(dto.ibu),
            forBottling: dto.forBottling === 'true' ? true : false,
            filtered: dto.filtered === 'true' ? true : false 
        };

        if(this.productService.getByTitle(dto.title)) {
            throw new HttpException('Товар с данным именем уже существует', HttpStatus.BAD_REQUEST);
        }

        if(!isNumber(id)) {
            throw new HttpException('Параметр id не является строкой', HttpStatus.BAD_REQUEST);
        }

        const beer = await this.getByProductId(id);
        if (!beer) {
            throw new HttpException("Товар не найден!", HttpStatus.BAD_REQUEST);
        }

        const grades = await this.gradeService.findByIds(dto.gradeIds);
        if (grades.length !== dto.gradeIds.length) {
            throw new HttpException('Сорт пива не был найден', HttpStatus.BAD_REQUEST);
        }

        if (dto.gradeIds) {
            beer.$set('grades', dto.gradeIds);
        }

        const productId = beer.productId;
        await this.productService.update(productId, prodData, image);
        if (this.beerRepo.update({ ...beerData }, { where: { productId: id } })) {
            return true;
        }

        return false;
    }

    async getByProductId(id: number): Promise<Beers> {
        const res = await this.beerRepo.findOne({
            include: {
                all: true,
                nested: true
            },
            where: { productId: id }
        });
        return res;
    }

    async getByids(id: number[]) {
        const res = await this.beerRepo.findAll({
            include: {all: true},
            where: {id}
        })
        return res;
    }

    async getList(page: number, limitPage: number = defaultLimitPage, filter: object = {}, sort: ISort = { sortField: '', order: '' }) {
        if (isNumber(page)) {
            if (isEmptyObject(filter)) {
                filter = {
                    include: {
                        model: Products, as: 'product',
                        where: {

                        }
                    }
                };
            }

            const { sortField, order } = sort;
            const query: any = paginate(filter, page, limitPage);

            if (sortField && order) {
                const sortArray = [
                    sortField,
                    order
                ];
                if (this.productService.isProductTableFields(sortField)) {
                    sortArray.unshift("product");
                }
                query.order = [sortArray]; //сортировка по полю из связной таблицы
            }

            const beerList = await this.beerRepo.findAndCountAll(query);

            if (beerList.rows.length <= 0) {
                throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
            }

            const lastPage = Math.ceil(beerList.count / limitPage) - 1;
            let nextPage = 0;
            if (lastPage > 0) {
                nextPage = page + 1;
            }

            return { ...beerList, nextPage, lastPage };
        }

        throw new HttpException('Параметр page не был передан', HttpStatus.BAD_REQUEST);
    }

    async getListByFilter(filter: IBeerFilter) {
        const {
            id = 0,
            title,
            description,
            grades = [],
            brandIds = [],
            typesPackagingIds = [],
            minPrice = 0,
            maxPrice = 0,
            volume,
            fortress,
            forBottling,
            filtered,
            sort = { sortField: '', order: '' },
            isActive,
            inStock,
            compound,
            page, limitPage
        } = filter

        //фильтрация по полю из связной таблицы
        let queryFilter: any = {
            include: {
                model: Products, as: 'product',
                where: {}
            },
            where: {}
        };

        queryFilter.include.where = this.productService.buildFilterByProductFields(queryFilter.include.where, {
            id,
            brandIds,
            typesPackagingIds,
            minPrice,
            maxPrice,
            title,
            description,
            isActive,
            inStock,
        });

        if (Array.isArray(grades) && grades.length > 0) {
            const beerIds = await this.gradeService.getBeersIdsByGrades(grades);
            queryFilter.where.id = beerIds;
        }

        if (volume && volume.minVolume && volume.maxVolume) {
            queryFilter.where.volume = {
                [Op.gte]: volume.minVolume,
                [Op.lte]: volume.maxVolume
            };
        }

        if (fortress && fortress.minFortress && fortress.maxFortress) {
            queryFilter.where.fortress = {
                [Op.gte]: fortress.minFortress,
                [Op.lte]: fortress.maxFortress
            };
        }

        if (forBottling) {
            queryFilter.where.forBottling = forBottling;
        }

        if (filtered) {
            queryFilter.where.filtered = filtered;
        }

        if(compound) {
            queryFilter.where.compound = { [Op.iLike]: `%${compound}%` } 
        }
        
        const findQuery = (query) => {return this.beerRepo.findAndCountAll(query)};
        return this.productService.getList(page, limitPage, queryFilter, findQuery, sort);
    }

    async getMinAndMaxVolume() {
        let where = {};
        const query: any[] = getMinMaxQuery({ colMin: 'volume', colMax: 'volume', minOutput: 'minVolume', maxOutput: 'maxVolume' });
        return await this.beerRepo.findAll({
            attributes: query,
            where
        });
    }

    async getMinAndMaxFortress() {
        let where = {};
        const query: any[] = getMinMaxQuery({ colMin: 'fortress', colMax: 'fortress', minOutput: 'minFortress', maxOutput: 'maxFortress' });
        return await this.beerRepo.findAll({
            attributes: query,
            where
        });
    }

    findAndCountAll(query) {
        return this.beerRepo.findAndCountAll(query);
    }
}
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
interface IStateBeer {
    forBottling: any,
    filtered: any
}
interface ISort {
    sortField: string,
    order: string
}
interface IBeerFilter {
    id: number,
    title: string,
    description: string,
    grades: number[],
    brandIds: number[],
    typesPackagingIds: number[],
    minPrice: number,
    maxPrice: number,
    volume: IVolume,
    fortress: IFortress,
    stateBeer: IStateBeer,
    isActive: string,
    sort: ISort,
    page: number, limitPage: number
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
            typePackagingId: Number(dto.typePackagingId)
        };

        const beerData = {
            compound: dto.compound,
            volume: Number(dto.volume),
            fortress: Number(dto.fortress),
            ibu: Number(dto.ibu),
            forBottling: dto.forBottling,
            filtered: dto.filtered
        };

        const grades = await this.gradeService.findByIds(dto.gradeIds);
        if (grades.length !== dto.gradeIds.length) {
            throw new HttpException('Сорт пива не был найден', HttpStatus.BAD_REQUEST);
        }

        const product = await this.productService.create(productData, image);

        try {
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
        };

        const beerData = {
            compound: dto.compound,
            volume: Number(dto.volume),
            fortress: Number(dto.fortress),
            ibu: Number(dto.ibu),
            forBottling: dto.forBottling === 'true' ? true : false,
            filtered: dto.filtered === 'true' ? true : false 
        };

        const beer = await this.getById(id);
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

    async remove(id) {
        const beer = await this.getById(id)
        if (!beer) {
            throw new HttpException("Товара не существует!", HttpStatus.NOT_FOUND);
        }

        await this.productService.remove(beer.productId);
        return await this.beerRepo.destroy({ where: { id } });
    }

    async getById(id: number): Promise<Beers> {
        const res = await this.beerRepo.findOne({
            include: {
                all: true,
                nested: true
            },
            where: { productId: id }
        });
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
            stateBeer,
            sort = { sortField: '', order: '' },
            isActive,
            page, limitPage
        } = filter
        const { minVolume, maxVolume } = volume;
        const { minFortress, maxFortress } = fortress;

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
            isActive
        });

        if (grades.length > 0) {
            const beerIds = await this.gradeService.getBeersIdsByGrades(grades);
            queryFilter.where.id = beerIds;
        }

        if (minVolume && maxVolume && minVolume > 0 && maxVolume > 0) {
            queryFilter.where.volume = {
                [Op.gte]: minVolume,
                [Op.lte]: maxVolume
            };
        }

        if (minFortress && maxFortress && minFortress > 0 && maxFortress > 0) {
            queryFilter.where.fortress = {
                [Op.gte]: minFortress,
                [Op.lte]: maxFortress
            };
        }

        const { forBottling, filtered } = stateBeer;
        if (forBottling == 'true' || forBottling == 'false') {
            queryFilter.where.forBottling = forBottling;
        }

        if (filtered == 'true' || filtered == 'false') {
            queryFilter.where.filtered = filtered;
        }

        const beers = await this.getList(page, limitPage, queryFilter, sort);
        return beers;
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

    async searchByName(q: string, page: number, limitPage: number = 0, sort: ISort = { sortField: '', order: '' }) {
        const query = {
            include: {
                model: Products, as: 'product',
                where: {
                    isActive: true,
                    [Op.or]: [
                        { title: { [Op.iLike]: `%${q}%` } },
                        { description: { [Op.iLike]: `%${q}%` } }
                    ]
                }
            }
        };
        return await this.getList(page, limitPage, query, sort);
    }
}
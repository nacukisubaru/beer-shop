import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { GradesService } from 'src/grades/grades.service';
import { paginate } from 'src/helpers/paginationHelper';
import { getMinMaxQuery } from 'src/helpers/sequlizeHelper';
import { isEmptyObject, isNumber } from 'src/helpers/typesHelper';
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

@Injectable()
export class BeersService {

    constructor(@InjectModel(Beers) private beerRepo: typeof Beers,
        private productService: ProductsService,
        private gradeService: GradesService) { }

    async create(dto: CreateBeerDto, image: any) {
        const productData = {
            title: dto.title,
            description: dto.description,
            price: dto.price,
            quantity: dto.quantity,
            brandId: dto.brandId,
            typePackagingId: dto.typePackagingId
        };

        const beerData = {
            compound: dto.compound,
            volume: dto.volume,
            fortress: dto.fortress,
            ibu: dto.ibu,
            forBottling: dto.forBottling
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

    async update(id: number, dto: UpdateBeerDto) {

        const prodData = {
            title: dto.title,
            description: dto.description,
            price: dto.price,
            quantity: dto.quantity,
            typePackagingId: dto.typePackagingId
        };

        const beerData = {
            compound: dto.compound,
            volume: dto.volume,
            fortress: dto.fortress,
            ibu: dto.ibu,
            forBottling: dto.forBottling
        };

        const beer = await this.beerRepo.findByPk(id);
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
        await this.productService.update(productId, prodData);
        if (this.beerRepo.update({ ...beerData }, { where: { id } })) {
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
        return await this.beerRepo.findByPk(id, { include: { all: true } });
    }

    async getList(page: number, limitPage: number = 0, filter: object = {}) {
        if (isNumber(page)) {
            if (isEmptyObject(filter)) {
                filter = { include: { all: true } };
            }

            const query = paginate(filter, page, limitPage);
            const beerList = await this.beerRepo.findAndCountAll(query);

            if (beerList.rows.length <= 0) {
                throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
            }

            beerList.rows = beerList.rows.filter((beer) => {
                if (beer.product.getDataValue('isActive')) {
                    return beer;
                }
            });
            return { ...beerList, nextPage: page + 1 };
        }

        throw new HttpException('Параметр page не был передан', HttpStatus.BAD_REQUEST);
    }

    async getListByFilter(grades: number[] = [], brandIds: number[] = [], typesPackaging: number[] = [], minPrice: number = 0, 
        maxPrice: number = 0, volume: IVolume, fortress: IFortress, forBottling:boolean = false, page: number, limitPage: number) {

        const { minVolume, maxVolume } = volume;
        const { minFortress, maxFortress } = fortress;

        const queryFilter: any = {
            include: { all: true },
            where: {},
        };

        if (brandIds || typesPackaging || minPrice || maxPrice) {
            const products = await this.productService.getListByFilter(brandIds, typesPackaging, minPrice, maxPrice);
            const productIds = products.map(product => {
                return product.id;
            });
            queryFilter.where.productId = productIds;
        }

        if (grades.length > 0) {
            const beerIds = await this.gradeService.getBeersIdsByGrades(grades);
            queryFilter.where.id = beerIds;
        }

        if(minVolume && maxVolume) {
            queryFilter.where.volume = {
                [Op.gte]: minVolume, 
                [Op.lte]: maxVolume
            };
        }

        if(minFortress && maxFortress) {
            queryFilter.where.fortress = {
                [Op.gte]: minFortress, 
                [Op.lte]: maxFortress
            };
        }

        queryFilter.where.forBottling = forBottling;
        const beers = await this.getList(page, limitPage, queryFilter);
        return beers;
    }

    async getMinAndMaxVolume() {
        let where = {};
        const query: any[] = getMinMaxQuery({colMin:'volume', colMax: 'volume', minOutput: 'minVolume', maxOutput: 'maxVolume'});
        return await this.beerRepo.findAll({
            attributes: query,
            where
        });
    }

    async getMinAndMaxFortress() {
        let where = {};
        const query: any[] = getMinMaxQuery({colMin:'fortress', colMax: 'fortress', minOutput: 'minFortress', maxOutput: 'maxFortress'});
        return await this.beerRepo.findAll({
            attributes: query,
            where
        });
    }
}

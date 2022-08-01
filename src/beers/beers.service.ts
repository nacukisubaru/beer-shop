import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BrandsService } from 'src/brands/brands.service';
import { Grades } from 'src/grades/grades.model';
import { GradesService } from 'src/grades/grades.service';
import { paginate } from 'src/helpers/paginationHelper';
import { isNumber } from 'src/helpers/typesHelper';
import { Products } from 'src/products/products.model';
import { ProductsService } from 'src/products/products.service';
import { Beers } from './beers.model';
import { CreateBeerDto } from './dto/create-beer.dto';
import { UpdateBeerDto } from './dto/update-beer.dto';

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
            brandId: dto.brandId
        };

        const beerData = {
            compound: dto.compound,
            volume: dto.volume,
            fortress: dto.fortress,
            ibu: dto.ibu,
        };

        const grades = await this.gradeService.findByIds(dto.gradeIds);
        if(grades.length !== dto.gradeIds.length) {
            throw new HttpException('Сорт пива не был найден', HttpStatus.BAD_REQUEST);
        }

        const product = await this.productService.create(productData, image);
        
        try {
            const beer = await this.beerRepo.create(beerData);
                
            beer.$set('grades', dto.gradeIds);
            beer.productId = product.id;
            beer.save();
            return beer;
        } catch(e) {
            return e;
        }
    }

    async update(id: number, dto: UpdateBeerDto) {

        const prodData = {
            title: dto.title,
            description: dto.description,
            price: dto.price,
            quantity: dto.quantity
        };

        const beerData = {
            compound: dto.compound,
            volume: dto.volume,
            fortress: dto.fortress,
            ibu: dto.ibu,
        };

        const beer = await this.beerRepo.findByPk(id);
        if(!beer) {
            throw new HttpException("Товар не найден!", HttpStatus.BAD_REQUEST);
        }

        const grades = await this.gradeService.findByIds(dto.gradeIds);
        if(grades.length !== dto.gradeIds.length) {
            throw new HttpException('Сорт пива не был найден', HttpStatus.BAD_REQUEST);
        }

        if(dto.gradeIds) {
            beer.$set('grades', dto.gradeIds);
        }

        const productId = beer.productId;
        await this.productService.update(productId, prodData);
        if(this.beerRepo.update({...beerData}, {where: {id}})) {
            return true;
        }
        
        return false;
    }

    async remove(id) {
        const beer = await this.getById(id)
        if(!beer) {
            throw new HttpException("Товара не существует!", HttpStatus.NOT_FOUND);
        }

        await this.productService.remove(beer.productId);
        return await this.beerRepo.destroy({where: {id}});
    }

    async getById(id: number): Promise<Beers> {
       return await this.beerRepo.findByPk(id, { include: { all: true } });
    }

    async getList(page: number, limitPage:number) {
        if(isNumber(page)) {
            const query = paginate({include: { all: true }}, page, limitPage);
            const beerList = await this.beerRepo.findAndCountAll(query);
        
            if(beerList.rows.length <= 0) {
                throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
            }

            beerList.rows = beerList.rows.filter((beer) => {
                if(beer.product.getDataValue('isActive')) {
                    return beer;
                }
            });
            return {...beerList, nextPage: page + 1};
        }

        throw new HttpException('Параметр page не был передан', HttpStatus.BAD_REQUEST);
    }

    async getListByFilter(grades:[] = [],  brandIds:[] = [], minPrice: number = 0, maxPrice: number = 0) {
        const queryFilter: any = {
            include: {all:true}, 
            where: {},
        };

        let productIds = [];

        if(grades.length > 0) {
            const beerIds = await this.gradeService.getBeersIdsByGrades(grades);
            queryFilter.where.id = beerIds;
            const beers = await this.beerRepo.findAll(queryFilter);
            productIds = beers.map(item => {return item.productId});
        }

        return await this.productService.getListByFilter(productIds, brandIds, minPrice, maxPrice);
    }

}

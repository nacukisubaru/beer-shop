import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { isEmptyObject, isNumber } from 'src/helpers/typesHelper';
import { paginate } from 'src/helpers/paginationHelper';
import { ProductsService } from 'src/products/products.service';
import { CreateSnackDto } from './dto/create-snack.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';
import { Snack } from './snacks.model';

@Injectable()
export class SnacksService {
    constructor(@InjectModel(Snack) private snackRepo: typeof Snack,
                private productService: ProductsService) {}


    async create(createSnackDto: CreateSnackDto, image:any) {
        const productData = {
            title: createSnackDto.title,
            description: createSnackDto.description,
            price: createSnackDto.price,
            quantity: createSnackDto.quantity,
            brandId: createSnackDto.brandId,
            typePackagingId: createSnackDto.typePackagingId
        };

        const product = await this.productService.create(productData, image);
        const snack = await this.snackRepo.create({weight: createSnackDto.weight});

        snack.productId = product.id;
        product.snackId = snack.id;
        product.save();
        snack.save();
        return snack;
    }

    async getList(page: number, limitPage: number = 0, filter: object = {}) {
        if(isNumber(page)) {
            if (isEmptyObject(filter)) {
                filter = { include: { all: true } };
            }
            const query = paginate(filter, page, limitPage);
            const snackList = await this.snackRepo.findAndCountAll(query);
            
            snackList.rows = snackList.rows.filter((snack) => {
                if(snack.product.getDataValue('isActive')) {
                    return snack;
                }
            });

            return { ...snackList, nextPage: page + 1 };
        }

        throw new HttpException('Параметр page не был передан', HttpStatus.BAD_REQUEST);
    }

    async getById(id: number) {
        return await this.snackRepo.findByPk(id, {include:{all:true}});
    }

    async update(id: number, updateSnackDto: UpdateSnackDto) {
        const prodData = {
            title: updateSnackDto.title,
            description: updateSnackDto.description,
            price: updateSnackDto.price,
            quantity: updateSnackDto.quantity,
            brandId: updateSnackDto.brandId
        };

        const snack = await this.snackRepo.findByPk(id);
        if(!snack) {
            throw new HttpException("Товар не найден!", HttpStatus.BAD_REQUEST);
        }

        const productId = snack.productId;
        await this.productService.update(productId, prodData);
        if(this.snackRepo.update({...snack, weight: updateSnackDto.weight}, {where: {id}})) {
            return true;
        }
        
        return false;
    }

    async getListByFilter(brandIds: number[] = [], typesPackaging: number[] = [], minPrice: number = 0, maxPrice: number = 0, page: number, limitPage: number) {
        const queryFilter: any = {
            include: { all: true },
            where: {},
        };

        if (brandIds || minPrice || maxPrice) {
            const products = await this.productService.getListByFilter(brandIds, typesPackaging, minPrice, maxPrice);
            const productIds = products.map(product => {
                return product.id;
            });
            queryFilter.where.productId = productIds;
        }

        const beers = await this.getList(page, limitPage, queryFilter);
        return beers;
    }
}

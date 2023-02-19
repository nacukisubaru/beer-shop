import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FishType } from 'src/fish-types/fish-types.model';
import { FishTypesService } from 'src/fish-types/fish-types.service';
import { isNumber } from 'src/helpers/typesHelper';
import { Products } from 'src/products/products.model';
import { ProductsService } from 'src/products/products.service';
import { CreateFishDto } from './dto/create-fish.dto';
import { UpdateFishDto } from './dto/update-fish.dto';
import { Fish } from './fish.model';

interface IFishFilter extends IProductFilter {
    fishTypeId: number,
    fishTypes: string[]
}

@Injectable()
export class FishService {
    constructor(
        @InjectModel(Fish) private fishRepo: typeof Fish,
        private fishTypesService: FishTypesService,
        private productService: ProductsService
    ) { }

    async create(createFishDto: CreateFishDto, image: BinaryData) {
        const productData = {
            title: createFishDto.title,
            description: createFishDto.description,
            price: Number(createFishDto.price),
            quantity: Number(createFishDto.quantity),
            brandId: Number(createFishDto.brandId),
            typePackagingId: Number(createFishDto.typePackagingId),
            isActive: createFishDto.isActive === 'true' ? true : false,
            inStock: createFishDto.inStock === 'true' ? true : false,
            isPromote: createFishDto.isPromote === 'true' ? true : false,
        };

        const productNameExist = await this.productService.getByTitle(createFishDto.title);
        if (productNameExist) {
            throw new HttpException('Товар с данным именем уже существует', HttpStatus.BAD_REQUEST);
        }
        
        const fishType = await this.fishTypesService.getById(createFishDto.fishTypeId);
        
        try {
            const product = await this.productService.create(productData, image);
            const fish = await this.fishRepo.create({ weight: createFishDto.weight, fishTypeId: createFishDto.fishTypeId, fishTypeName: fishType.name });

            fish.productId = product.id;
            product.fishId = fish.id;
            product.save();
            fish.save();
            return fish;
        } catch (e) {
            return e;
        }
    }

    async update(id: number, updateFishDto: UpdateFishDto, image: BinaryData) {
        const prodData = {
            title: updateFishDto.title,
            description: updateFishDto.description,
            price: Number(updateFishDto.price),
            quantity: Number(updateFishDto.quantity),
            brandId: Number(updateFishDto.brandId),
            typePackagingId: Number(updateFishDto.typePackagingId),
            isActive: updateFishDto.isActive === 'true' ? true : false,
            inStock: updateFishDto.inStock === 'true' ? true : false,
            isPromote: updateFishDto.isPromote === 'true' ? true : false,
        };

        if (!isNumber(id)) {
            throw new HttpException('Параметр id не является строкой', HttpStatus.BAD_REQUEST);
        }

        const fish = await this.getByProductId(id);
        if (!fish) {
            throw new HttpException("Товар не найден!", HttpStatus.BAD_REQUEST);
        }

        const productNameExist = await this.productService.getByTitle(updateFishDto.title);
        if (productNameExist && updateFishDto.title !== fish.product.title) {
            throw new HttpException('Товар с данным именем уже существует', HttpStatus.BAD_REQUEST);
        }

        const fishType = await this.fishTypesService.getById(updateFishDto.fishTypeId);
        const productId = fish.productId;
        
        await this.productService.update(productId, prodData, image);
        if (this.fishRepo.update({ weight: Number(updateFishDto.weight), fishTypeId: updateFishDto.fishTypeId, fishTypeName: fishType.name }, { where: { productId: id } })) {
            return true;
        }

        return false;
    }

    async getByProductId(id: number): Promise<Fish> {
        const res = await this.fishRepo.findOne({
            include: {
                all: true,
                nested: true
            },
            where: { productId: id }
        });
        return res;
    }

    async getById(id: number) {
        return await this.fishRepo.findByPk(id, { include: { all: true } });
    }

    async getListByFilter(filter: IFishFilter, sort: ISort, page: number, limitPage: number) {
        const queryFilter: any = {
            include: {model: Products, as: 'product', where: {}},
            where: {}
        };

        const findQuery = (query) => { return this.findAndCountAll(query) };
        queryFilter.include.where = this.productService.buildFilterByProductFields(queryFilter.include.where, filter);
        
        if (filter.fishTypeId) {
            queryFilter.where.fishTypeId = filter.fishTypeId;
        }

        if (filter.fishTypes) {
            queryFilter.where.fishTypeId = filter.fishTypes;
        }

        return this.productService.getList(page, limitPage, queryFilter, findQuery, sort);
    }

    async getListByFishTypeId(fishTypeId: number) {
      return await this.fishRepo.findAll({where: {fishTypeId}});
    }

    findAndCountAll(query) {
        return this.fishRepo.findAndCountAll(query);
    }
}

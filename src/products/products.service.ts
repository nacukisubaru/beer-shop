import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Products } from './products.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Grades } from 'src/grades/grades.model';
import { BrandsService } from 'src/brands/brands.service';
import { FilesService } from 'src/files/filtes.service';
import { Op, where } from 'sequelize';
import sequelize from 'sequelize';
import { getMinMaxQuery } from 'src/helpers/sequlizeHelper';
import { TypePackagingService } from 'src/type-packaging/type-packaging.service';
import { defaultLimitPage, paginate } from 'src/helpers/paginationHelper';
import { isEmptyObject, isNumber } from 'src/helpers/typesHelper';
import { isObject } from 'class-validator';
interface IProductFilter {
    id?: number,
    brandIds?: number[],
    typesPackagingIds?: number[],
    minPrice?: number, 
    maxPrice?: number, 
    title?: string, 
    description?: string,
    isActive?: string,
    inStock?: boolean,
}
@Injectable()
export class ProductsService {
    constructor(@InjectModel(Products) private productRepo: typeof Products,
        private brandService: BrandsService,
        private fileService: FilesService,
        private typePackagingService: TypePackagingService) { }

    public async create(dto: CreateProductDto, image: BinaryData) {
        const brand = await this.brandService.getById(dto.brandId);
        if (!brand) {
            throw new HttpException('Бренд не был найден', HttpStatus.BAD_REQUEST);
        }

        const typePackaging = await this.typePackagingService.getById(dto.typePackagingId);
        if (!typePackaging) {
            throw new HttpException('Тип упаковки не был найден', HttpStatus.BAD_REQUEST);
        }

        const prepareProduct:any = dto;
        if(image) {
            const fileName = await this.fileService.createFile(image, 'products');
            if(fileName) {
                prepareProduct.image = fileName; 
            }
        }

        const product = await this.productRepo.create(prepareProduct);

        product.brandName = brand.name;
        product.typePackagingName = typePackaging.name;
        product.save();
        return product;
    }

    public async getListByFilter(brandIds: number[] = [], typesPackagingIds: number[] = [], minPrice: number = 0, maxPrice: number = 0) {
        const queryFilter: any = {
            include: { all: true },
            where: {}
        };

        if (brandIds.length > 0) {
            queryFilter.where.brandId = { [Op.or]: brandIds };
        }

        if (minPrice && maxPrice && minPrice > 0 && maxPrice > 0) {
            queryFilter.where.price = {
                [Op.gte]: minPrice,
                [Op.lte]: maxPrice
            };
        }

        if (typesPackagingIds.length > 0) {
            queryFilter.where.typePackagingId = { [Op.or]: typesPackagingIds };
        }

        return await this.productRepo.findAll(queryFilter);
    }

    public async getMinAndMaxPrice(productType: string = "beers") {
        let where = {};
        if (productType === "beers") {
            where = {
                beerId: {
                    [Op.ne]: null
                }
            };
        } else if (productType === "snacks") {
            where = {
                snackId: {
                    [Op.ne]: null
                }
            };
        }

        const query: any[] = getMinMaxQuery({ colMin: 'price', colMax: 'price', minOutput: 'minPrice', maxOutput: 'maxPrice' });
        return await this.productRepo.findAll({
            attributes: query,
            where
        });
    }

    public async searchByTitleAndDesc(q: string) {
        const products = await this.productRepo.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.iLike]: `%${q}%` } },
                    { description: { [Op.iLike]: `%${q}%` } }
                ]
            }
        });
        return products.map((product) => {
            return product.id;
        });
    }

    public async getProductsByStock(productsIds: number[] | number, inStock: boolean = true) {
        const query: any = { where: { id: productsIds, inStock: inStock, isActive: true }, include: { all: true } };
        if (Array.isArray(productsIds)) {
            query.where.id = { [Op.or]: productsIds };
        }

        return await this.productRepo.findAll(query);
    }

    public async addShow(id: number) {
        const product = await this.getById(id);
        if (!product) {
            throw new HttpException('Товар не найден', HttpStatus.BAD_REQUEST);
        }

        return this.productRepo.update({ show: product.show + 1 }, { where: { id } });
    }

    public buildFilterByProductFields(filterObj: any, filter:IProductFilter) {
        const {
            id = 0,
            brandIds = [],
            typesPackagingIds = [],
            minPrice = 0, 
            maxPrice = 0, 
            title = "", 
            description = "",
            isActive,
            inStock,
        } = filter;
        
        if(id) {
            filterObj.id = id;
        }
        
        if(isActive && (isActive === 'true' || isActive === 'false')) {
            filterObj.isActive = isActive === 'false' ? false : true;
        }

        if (Array.isArray(brandIds) && brandIds.length > 0) {
            filterObj.brandId = { [Op.or]: brandIds };
        }

        if (minPrice && maxPrice && minPrice > 0 && maxPrice > 0) {
            filterObj.price = {
                [Op.gte]: minPrice,
                [Op.lte]: maxPrice
            };
        }

        if (Array.isArray(typesPackagingIds) && typesPackagingIds.length > 0) {
            filterObj.typePackagingId = { [Op.or]: typesPackagingIds };
        }

        if(title) {
            filterObj.title = { [Op.iLike]: `%${title}%` };
        }

        if(description) {
            filterObj.description = { [Op.iLike]: `%${description}%` } 
        }

        if(inStock) {
            filterObj.inStock = inStock;
        }

        return filterObj;
    }

    public isProductTableFields(field: string) {
        const productFields = Products.getAttributes();
        for (let prodKey in productFields) {
            if (prodKey.toString() === field) {
                return true;
            }
        }
        return false;
    }

    public async update(id: number, dto: UpdateProductDto, image: BinaryData) {
        const brand = await this.brandService.getById(dto.brandId);
        if (!brand) {
            throw new HttpException('Бренд не был найден', HttpStatus.BAD_REQUEST);
        }

        const typePackaging = await this.typePackagingService.getById(dto.typePackagingId);
        if (!typePackaging) {
            throw new HttpException('Тип упаковки не был найден', HttpStatus.BAD_REQUEST);
        }

        const prepareProduct:any = { ...dto, brandName: brand.name, typePackagingName: typePackaging.name };
        if(image) {
            const fileName = await this.fileService.createFile(image, 'products');
            if(fileName) {
                prepareProduct.image = fileName; 
            }
        }
    
        return await this.productRepo.update(prepareProduct, { where: { id } })
    }

    async getList(page: number, limitPage: number = defaultLimitPage, filter: object = {}, callback = (query: any) =>{}, sort?: ISort) {
        if (!isNumber(page)) {
            throw new HttpException('Параметр page не был передан', HttpStatus.BAD_REQUEST);
        }

        if(!isNumber(limitPage)) {
            throw new HttpException('Параметр limitPage не был передан', HttpStatus.BAD_REQUEST);
        }

        if (isEmptyObject(filter)) {
            filter = {
                include: {
                    model: Products, as: 'product',
                    where: {}
                }
            };
        }

        const query: any = paginate(filter, page, limitPage);
        if (sort.sortField && sort.order) {
            const sortArray = [
                sort.sortField,
                sort.order
            ];
            if (this.isProductTableFields(sort.sortField)) {
                sortArray.unshift("product");
            }
            query.order = [sortArray]; //сортировка по полю из связной таблицы
        }
        
        const data: any = await callback(query);
        if (!data.rows || data.rows.length <= 0) {
            throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
        }

        const lastPage = Math.ceil(data.count / limitPage) - 1;
        let nextPage = 0;
        if (lastPage > 0) {
            nextPage = page + 1;
        }

        return { ...data, nextPage, lastPage };
    
    }

    async searchByName(q: string, page: number, limitPage: number = 0, callback = (query: any) =>{}, sort: ISort) {
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

        return await this.getList(page, limitPage, query, callback, sort);
    }

    public async remove(id): Promise<Number> {
        return await this.productRepo.destroy({ where: { id } });
    }

    public async switchActive(id: number, isActive: boolean): Promise<Object> {
        return await this.productRepo.update({ isActive }, { where: { id } });
    }

    public async getById(id): Promise<Products> {
        return await this.productRepo.findByPk(id, { include: { all: true } });
    }

    public async getAll(): Promise<Products[]> {
        const product: any = await this.productRepo.findAll({ include: { all: true } });
        return product;
    }

    public async getListByBrand(brandId: number) {
        return await this.productRepo.findAll({ include: { all: true }, where: { brandId } });
    }
}

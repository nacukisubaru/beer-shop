import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { ProductsService } from 'src/products/products.service';
import { BasketProducts } from './basket-products.model';
import { Basket } from './basket.model';
import { CreateBasketDto } from './dto/create-basket.dto';
import { IBasketProduct, UpdateBasketDto } from './dto/update-basket.dto';
import * as bcrypt from 'bcryptjs';
import { Products } from 'src/products/products.model';
var moment = require('moment'); // require

interface IPrice {
    price: number,
    quantity: number
} 

@Injectable()
export class BasketService {
    public products: Products[];

    constructor(
        @InjectModel(Basket) private basketRepo: typeof Basket,
        @InjectModel(BasketProducts) private basketProductRepo: typeof BasketProducts,
        private productService: ProductsService
    ) { 
        this.products = [];
    }

    public async getList() {
        return await this.basketRepo.findAll({ include: { all: true } });
    }

    public async addProduct(createBasketDto: CreateBasketDto, userId: number = 0) {
        let basket: Basket;
        const productId = createBasketDto.productId;
        delete createBasketDto.productId;

        if (createBasketDto.hash) {
            basket = await this.getBasketByHash(createBasketDto.hash);
        } else {
            const product = await this.productService.getById(productId);
            if (!product) {
                throw new HttpException('Товара с айди ' + productId + 'не существует', HttpStatus.BAD_REQUEST);
            }

            const basketFields: any = { ...createBasketDto };
            if (userId) {
                basketFields.userId = userId;
                const userBasket = await this.getFreeBasketByUser(userId);
                if (userBasket) {
                    throw new HttpException('У пользователя уже существует корзина не оформленная в заказе', HttpStatus.BAD_REQUEST);
                }
            }

            basket = await this.createBasketWithHash(product, basketFields);
        }

        if (basket) {
            const basketProduct = await basket.$add('products', productId);
            let prodId = productId;
            if (basketProduct) {
                prodId = basketProduct[0].id;
            }

            this.basketProductRepo.update({ quantity: createBasketDto.quantity }, { where: { id: prodId } });
            return basket;
        }

        throw new HttpException('Корзина не найдена!', HttpStatus.NOT_FOUND);
    }

    public async updateProduct(updateBasketDto: UpdateBasketDto) {
        const basket = await this.getBasketByHash(updateBasketDto.hash, true);
        if (basket && basket.products.length > 0) {
            const product: any = basket.products.filter((product) => {
                if (product.id === updateBasketDto.productId) {
                    return product;
                }
            });

            if (product.length > 0) {
                const basketProducts = product[0].BasketProducts;
                if (basketProducts) {
                    if (updateBasketDto.quantity !== basketProducts.quantity) {
                        this.basketProductRepo.update({ quantity: updateBasketDto.quantity }, { where: { id: basketProducts.id } });
                    }
                    return true;
                }
            }
        }

        throw new HttpException('Корзина или товар не найдены!', HttpStatus.BAD_REQUEST);
    }

    public async removeProduct(ids: number[], basketHash: string) {
        const basket = await this.getBasketByHash(basketHash, true);
        if (basket) {
            this.basketProductRepo.destroy({ where: { productId: { [Op.or]: ids } } });
            return true;
        }

        throw new HttpException('Корзина или товар не найдены!', HttpStatus.BAD_REQUEST);
    }
    private async createBasketWithHash(product: Products, basketFields: any = {}) {
        const stringForHash = product.getDataValue("title") + product.getDataValue("brandName") + product.getDataValue("description") + moment().unix();
        const hash = await bcrypt.hash(stringForHash, 5);
        return await this.basketRepo.create({ ...basketFields, hash });
    }

    private async addProductsForBasket(basket: Basket, userId: number) {
        if (basket && basket.products) {
            const newBasket = await this.createBasketWithHash(basket.products[0], { userId });
            await this.basketProductRepo.update({ basketId: newBasket.id }, { where: { basketId: basket.id } });
            return true;
        }

        return false;
    }

    public async getBasketByUserAndPoolingBaskets(hash: string = '', userId: number) {
        if (!userId) {
            throw new HttpException('Не передан параметр userId', HttpStatus.BAD_REQUEST);
        }

        let basketId = 0;
        let basketByHash: Basket;
        if (hash) {
            basketByHash = await this.basketRepo.findOne({ where: { hash }, include: { all: true } });
        }

        if (basketByHash) {
            basketId = basketByHash.id;
        }

        const userBasket = await this.getFreeBasketByUser(userId);
        if (!userBasket && basketId) {
            await this.addProductsForBasket(basketByHash, userId);
        } else if (!userBasket && !basketId) {
            throw new HttpException('Корзина по id пользователя ' + userId + ' не найдена', HttpStatus.BAD_REQUEST);
        }

        if (userBasket && basketId) {
            await this.poolingBaskets(basketId, userBasket);
        }

        const basketUser = await this.getFreeBasketByUser(userId);
        if (basketUser) {
            return basketUser;
        }

        return false;
    }

    private async updateProductsInBaskets(products: IBasketProduct[]) {
        for (const product in products) {
            const prod: IBasketProduct = products[product];
            await this.basketProductRepo.update({ quantity: prod.quantity }, { where: { productId: prod.productId } });
        }
    }

    private async poolingBaskets(basketId: number, userBasket: Basket) {
        const basket = await this.getById(basketId);
        if (basket.hash !== userBasket.hash) {
            if (basket && basket.products) {
                const productIds = basket.products.map((product) => {
                    return product.id;
                });

                const productsBasketUser = await this.getProductsByBasketId(userBasket.id, productIds);
                const basketProducts = await this.getProductsByBasketId(basketId, productIds);
                if (basketProducts.length) {
                    const basketProductsIds = basketProducts.map((product) => {
                        return product.productId;
                    });

                    const productForUpd = basketProducts.map((product) => {
                        let quantity = product.quantity;
                        const matchingItem = productsBasketUser.find((productUser) => {
                            if (productUser.productId === product.productId) {
                                return productUser;
                            }
                        });

                        if (matchingItem) {
                            quantity = quantity + matchingItem.quantity
                        }

                        return { productId: product.productId, quantity };
                    });

                    if (productForUpd.length) {
                        await userBasket.$add('products', basketProductsIds);
                        await this.updateProductsInBaskets(productForUpd);
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private async getProductsByBasketId(basketId: number, productIds: number[]) {
        return await this.basketProductRepo.findAll({ where: { basketId, productId: { [Op.or]: productIds } }, include: { all: true } });
    }

    public async getProductsNotInStock(basketId: number) {
        const basket = await this.getById(basketId);

        if (basket && basket.products.length) {
            const productsNotInStock = basket.products.filter((product) => {
                if (!product.inStock && product.isActive) {
                    return product;
                }
            });

            if (productsNotInStock.length) {
                return productsNotInStock;
            }
        }

        return false;
    }

    public async getBasketByHash(hash: string, checkProductExist: boolean = false) {
        const basket = await this.basketRepo.findOne({ where: { hash }, include: { all: true }, nest: true });
        this.products = basket.products;
        if (!basket) {
            throw new HttpException('Корзина не существует', HttpStatus.BAD_REQUEST);
        }
        if (!basket.products.length && checkProductExist) {
            throw new HttpException('Продукты в корзине не найдены', HttpStatus.NOT_FOUND);
        }

        return basket;
    }

    public async getBasketAmount(basketId: number) {
        const basketProducts = await this.basketProductRepo.findAll({ where: { basketId } });
        if(!this.products.length || !basketProducts.length) {
            throw new HttpException('Товары не найдены', HttpStatus.NOT_FOUND);
        }

        const productsQuantites = new Map();
        basketProducts.map((product) => {
            productsQuantites.set(product.productId, product.quantity)
        });

        const prices: any = this.products.map((product: Products) => {
           const prodQuan = productsQuantites.get(product.getDataValue("id"));
           return {price: product.getDataValue("price"), quantity: prodQuan};
        });

        return this.calcualteAmount(prices);
    }

    private calcualteAmount(prices: IPrice[]) {
        const initialValue = 0;
        const total: any = prices.length > 0 ? prices.reduce((accumulator, currentValue: any) => {
            return accumulator + currentValue.price * currentValue.quantity;
        }, initialValue) : 0;
        return total;
    }

    public async getByIds(ids: number[]): Promise<Basket[]> {
        return await this.basketRepo.findAll({ include: { all: true }, where: { id: ids } });
    }

    public async getById(id: number): Promise<Basket> {
        return await this.basketRepo.findOne({ include: { all: true }, where: { id } });
    }

    private async getFreeBasketByUser(userId: number) {
        const userBasket = await this.basketRepo.findOne({ include: { all: true }, where: { userId, orderId: null } });
        return userBasket;
    }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BasketProducts } from './basket-products.model';
import { Basket } from './basket.model';
import { CreateBasketDto } from './dto/create-basket.dto';
import { RemoveProductBasketDto } from './dto/remove-product-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';

@Injectable()
export class BasketService {

    constructor(@InjectModel(Basket) private basketRepo: typeof Basket,
                @InjectModel(BasketProducts) private basketProductRepo: typeof BasketProducts) { }

    async getList() {
        return await this.basketRepo.findAll({ include: { all: true } });
    }

    async addProduct(createBasketDto: CreateBasketDto) {
        let basket;
        const productId = createBasketDto.productId;
        delete createBasketDto.productId;
        
        if(createBasketDto.id) {
            basket = await this.basketRepo.findByPk(createBasketDto.id, {include:{all:true}});
        } else {
            basket = await this.basketRepo.create(createBasketDto);
        }

        if(basket) {
            const basketProduct = await basket.$add('products', productId);
            let prodId = productId;
            if(basketProduct) {
                prodId = basketProduct[0].id;
            }

            this.basketProductRepo.update({quantity: createBasketDto.quantity}, {where:{id: prodId}});
            return basket;
        }
 
        throw new HttpException('Корзина не найдена!', HttpStatus.NOT_FOUND);
    }

    async updateProduct(updateBasketDto: UpdateBasketDto) {
        const basket = await this.basketRepo.findByPk(updateBasketDto.id, {include:{all:true}});
        if(basket && basket.products.length > 0) {
            const product: any = basket.products.filter((product) => {
                if(product.id === updateBasketDto.productId) {
                    return product;
                }
            });

            if(product.length > 0) {
                const basketProducts = product[0].BasketProducts;
                if(basketProducts) {
                    if(updateBasketDto.quantity !== basketProducts.quantity) {
                        this.basketProductRepo.update({quantity: updateBasketDto.quantity}, {where: {id: basketProducts.id}});
                    }
                    return true;
                }
            }
        }

        throw new HttpException('Корзина или товар не найдены!', HttpStatus.BAD_REQUEST);
    }

    async removeProduct(removeProductDto: RemoveProductBasketDto) {
        const basket = await this.basketRepo.findByPk(removeProductDto.id, {include:{all:true}});
        if(basket && basket.products.length > 0) {
            const products: any = basket.products.filter((product) => {
                if(product.id !== removeProductDto.productId) {
                    return product.id;
                }
            });
            
            basket.$set('products', products);
            return true;
        }

        throw new HttpException('Корзина или товар не найдены!', HttpStatus.BAD_REQUEST);
    }

    async getByIds(ids: number[]): Promise<Basket[]> {
       return await this.basketRepo.findAll({include: {all: true}, where:{id: ids}});
    }

    async getById(id: number): Promise<Basket> {
        return await this.basketRepo.findOne({include: {all: true}, where: {id}});
    }

    async getFreeBasketByUser(userId: number) {
        return await this.basketRepo.findOne({include:{all:true}, where: {userId, orderId: null}});
    }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BasketProducts } from './basket-products.model';
import { Basket } from './basket.model';
import { CreateBasketDto } from './dto/create-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';

@Injectable()
export class BasketService {

    constructor(@InjectModel(Basket) private basketRepo: typeof Basket,
               @InjectModel(BasketProducts) private basketProductRepo: typeof BasketProducts) { }

    async getList() {
        return await this.basketRepo.findAll({ include: { all: true } });
    }

    async addProduct(createBasketDto: CreateBasketDto): Promise<Basket> {
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
            if(basketProduct) {
                this.basketProductRepo.update( {quantity: createBasketDto.quantity}, {where:{id: basketProduct[0].id}})
            }

            return basket;
        }
 
        throw new HttpException('Корзина не найдена!', HttpStatus.NOT_FOUND);
    }

    async updateProduct(updateBasketDto: UpdateBasketDto) {
        const basket = await this.basketRepo.findByPk(updateBasketDto.id, {include:{all:true}});
        if(basket) {
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

    remove(id: number) {
        return `This action removes a #${id} basket`;
    }
}

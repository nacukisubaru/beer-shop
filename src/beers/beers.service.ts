import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ProductsService } from 'src/products/products.service';
import { Beers } from './beers.model';
import { CreateBeerDto } from './dto/create-beer.dto';

@Injectable()
export class BeersService {

    constructor(@InjectModel(Beers) private beerRepo: typeof Beers,
                private productService: ProductsService) { }

    async create(dto: CreateBeerDto) {
        const productData = {
            title: dto.title,
            description: dto.description,
            articule: "dsfsd545sd",
            price: dto.price,
            quantity: dto.quantity,
            typeId: 1
        }
        
        const product = await this.productService.create(productData);

        const beerData = {
            compound: dto.compound,
            volume: dto.volume,
            fortress: dto.fortress,
            ibu: dto.ibu,
           // productId: product.id
        }

        const beer = await this.beerRepo.create(beerData);
        beer.productId = product.id;
        beer.save();
        return beer;
    }

    async getById(id) {
        this.beerRepo.findByPk(id, { include: { all: true } });
    }

    async getAll() {
        return await this.beerRepo.findAll({ include: { all: true } });
    }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { GradesService } from 'src/grades/grades.service';
import { ProductsService } from 'src/products/products.service';
import { Beers } from './beers.model';
import { CreateBeerDto } from './dto/create-beer.dto';

@Injectable()
export class BeersService {

    constructor(@InjectModel(Beers) private beerRepo: typeof Beers,
                private productService: ProductsService,
                private gradeService: GradesService) { }

    async create(dto: CreateBeerDto) {
        const productData = {
            title: dto.title,
            description: dto.description,
            articule: "dsfsd545sd",
            price: dto.price,
            quantity: dto.quantity
        };

        const beerData = {
            compound: dto.compound,
            volume: dto.volume,
            fortress: dto.fortress,
            ibu: dto.ibu,
        };
        
        const grade = await this.gradeService.findByCode(dto.grade);

        if(!grade) {
            throw new HttpException('Сорт пива не существует', HttpStatus.BAD_REQUEST);
        }

        const product = await this.productService.create(productData);
        const beer = await this.beerRepo.create(beerData);
  
        beer.$set('grades', [grade.id]);
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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Grades } from 'src/grades/grades.model';
import { GradesService } from 'src/grades/grades.service';
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

    async create(dto: CreateBeerDto) {
        const productData = {
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

    async getAll() {
        const beerList = await this.beerRepo.findAll({include: { all: true }});
        return beerList.filter((beer) => {
            if(beer.product.getDataValue('isActive')) {
                return beer;
            }
        })
    }


}

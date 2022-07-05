import { Injectable } from '@nestjs/common';
import { Products } from './products.model';
import { InjectModel } from '@nestjs/sequelize';
import { BeersService } from 'src/beers/beers.service';
import { Beers } from 'src/beers/beers.model';
import { BeerGrades } from 'src/grades/beers-grades.model';

@Injectable()
export class ProductsService {
    constructor(@InjectModel(Products) private productRepo: typeof Products,
                ) {}

    async getAll() {
      const product: any = await this.productRepo.findAll({include: { model: BeerGrades}});
      return product;
      //return product[0].beer;
      //this.beerSerive.getById(product.beer.id)
    }
}

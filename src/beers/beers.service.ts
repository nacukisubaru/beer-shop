import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Beers } from './beers.model';

@Injectable()
export class BeersService {

    constructor(@InjectModel(Beers) private beerRepo: typeof Beers) {}

    async getById(id) {
        this.beerRepo.findByPk(id, {include:{all:true}});
    }

    async getAll() {
        return await this.beerRepo.findAll({include: {all:true}});
    }
}

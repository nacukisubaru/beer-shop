import { Controller, Get, Post } from '@nestjs/common';
import { BeersService } from './beers.service';

@Controller('beers')
export class BeersController {

    constructor(private beerService: BeersService) {}

    @Get()
    getList() {
        return this.beerService.getAll();
    }

    @Post('/create')
    createBeer() {

    }
}

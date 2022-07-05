import { Body, Controller, Get, Post } from '@nestjs/common';
import { BeersService } from './beers.service';
import { CreateBeerDto } from './dto/create-beer.dto';

@Controller('beers')
export class BeersController {

    constructor(private beerService: BeersService) {}

    @Get()
    getList() {
        return this.beerService.getAll();
    }

    @Post('/create')
    createBeer(@Body() dto: CreateBeerDto) {
       return this.beerService.create(dto);
    }
}

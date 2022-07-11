import { Body, Controller, Delete, Get, Param, Post, UsePipes } from '@nestjs/common';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { BeersService } from './beers.service';
import { CreateBeerDto } from './dto/create-beer.dto';
import { UpdateBeerDto } from './dto/update-beer.dto';

@Controller('beers')
export class BeersController {

    constructor(private beerService: BeersService) {}

    @Get()
    getList() {
        return this.beerService.getAll();
    }

    @UsePipes(ValidationPipe)
    @Post('/create')
    createBeer(@Body() dto: CreateBeerDto) {
       return this.beerService.create(dto);
    }

    @UsePipes(ValidationPipe)
    @Post('/update')
    update(@Body() dto: UpdateBeerDto) {
        const id = dto.id;
        delete dto.id;
        return this.beerService.update(id, dto);
    }

    @Delete('/remove/:id')
    remove(@Param('id') id: string) {
        return this.beerService.remove(id);
    }    
}

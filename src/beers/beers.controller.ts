import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors, UsePipes } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { BeersService } from './beers.service';
import { CreateBeerDto } from './dto/create-beer.dto';
import { UpdateBeerDto } from './dto/update-beer.dto';

@Controller('beers')
export class BeersController {

    constructor(private beerService: BeersService) { }

    @Get()
    getList(@Query('page') page: string, @Query('limitPage') limitPage: string) {
        return this.beerService.getList(Number(page), Number(limitPage));
    }

    @Get('/getById/:id')
    getById(@Param('id') id: string) {
        return this.beerService.getById(Number(id));
    }

    @Get('/getListByFilter')
    getListByFilter(@Query('grades') grades: number[], @Query('brandIds') brandIds: number[],
        @Query('typesPackaging') typesPackaging: number[], @Query('minPrice') minPrice: number, 
        @Query('maxPrice') maxPrice: number, @Query('minVolume') minVolume: number, 
        @Query('maxVolume') maxVolume: number, @Query('minFortress') minFortress: number, 
        @Query('maxFortress') maxFortress: number, @Query('forBottling') forBottling: boolean, @Query('filtered') filtered: boolean,
        @Query('page') page: string, @Query('limitPage') limitPage: string) {
         //   return forBottling;
        return this.beerService.getListByFilter(
            grades, 
            brandIds, 
            typesPackaging,
            minPrice, 
            maxPrice,
            { minVolume, maxVolume }, 
            { minFortress, maxFortress },
            { forBottling, filtered},
            Number(page), 
            Number(limitPage)
        );
    }

    @Get('/getMinAndMaxVolume')
    getMinAndMaxVolume() {
       return this.beerService.getMinAndMaxVolume();
    }

    @Get('/getMinAndMaxFortress')
    getMinAndMaxFortress() {
       return this.beerService.getMinAndMaxFortress();
    }

    // @UsePipes(ValidationPipe)
    @Post('/create')
    @UseInterceptors(FileInterceptor('image'))
    createBeer(@Body() dto: CreateBeerDto, @UploadedFile() image) {
        return this.beerService.create(dto, image);
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

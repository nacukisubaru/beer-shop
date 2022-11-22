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
    getList(@Query('page') page: string, @Query('limitPage') limitPage: string, @Query('sortField') sortField: string, @Query('order') order: string) {
        return this.beerService.getList(Number(page), Number(limitPage), {}, {sortField, order});
    }

    @Get('/getById/:id')
    getById(@Param('id') id: string) {
        return this.beerService.getById(Number(id));
    }

    @Get('/getListByFilter')
    getListByFilter(@Query('id') id: string, @Query('grades') grades: number[], @Query('brandIds') brandIds: number[],
        @Query('typesPackagingIds') typesPackagingIds: number[], @Query('minPrice') minPrice: number, 
        @Query('maxPrice') maxPrice: number, @Query('minVolume') minVolume: number, 
        @Query('maxVolume') maxVolume: number, @Query('minFortress') minFortress: number, 
        @Query('maxFortress') maxFortress: number, @Query('forBottling') forBottling: boolean, 
        @Query('filtered') filtered: boolean, @Query('title') title: string, @Query('isActive') isActive: string,
        @Query('description') description: string, @Query('page') page: string, @Query('limitPage') limitPage: string, 
        @Query('sortField') sortField: string = '', @Query('order') order: string = '') {
            
        return this.beerService.getListByFilter({
            id: Number(id),
            isActive,
            title,
            description,
            grades, 
            brandIds, 
            typesPackagingIds,
            minPrice, 
            maxPrice,
            volume: { minVolume, maxVolume }, 
            fortress: { minFortress, maxFortress },
            stateBeer: { forBottling, filtered},
            sort: {sortField, order},
            page: Number(page), 
            limitPage: Number(limitPage)
        }
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

    @Get('/search')
    search(@Query('q') q: string, @Query('page') page: string, @Query('limitPage') limitPage: string,  @Query('sortField') sortField: string = '', @Query('order') order: string = '') {
        return this.beerService.searchByName(q, Number(page), Number(limitPage), {sortField, order});
    }

    @UsePipes(ValidationPipe)
    @Post('/create')
    @UseInterceptors(FileInterceptor('image'))
    create(@Body() dto: CreateBeerDto, @UploadedFile() image) {
        return this.beerService.create(dto, image);
    }

    @UsePipes(ValidationPipe)
    @Post('/update')
    @UseInterceptors(FileInterceptor('image'))
    update(@Body() dto: UpdateBeerDto, @UploadedFile() image) {
        const id = Number(dto.id);
        delete dto.id;
        return this.beerService.update(id, dto);
    }

    @Delete('/remove/:id')
    remove(@Param('id') id: string) {
        return this.beerService.remove(id);
    }
}

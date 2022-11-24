import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseInterceptors, UsePipes } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { isNumeric } from 'src/helpers/typesHelper';
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
    getListByFilter(@Query('id') id: string, @Query('grades') grades: string[], @Query('brandIds') brandIds: string[],
        @Query('typesPackagingIds') typesPackagingIds: string[], @Query('minPrice') minPrice: string, 
        @Query('maxPrice') maxPrice: string, @Query('minVolume') minVolume: string, 
        @Query('maxVolume') maxVolume: string, @Query('minFortress') minFortress: string, 
        @Query('maxFortress') maxFortress: string, @Query('forBottling') forBottling: string, 
        @Query('filtered') filtered: string, @Query('title') title: string, @Query('isActive') isActive: string,
        @Query('description') description: string, @Query('inStock') inStock: string,
        @Query('compound') compound: string,
        @Query('page') page: string, @Query('limitPage') limitPage: string, 
        @Query('sortField') sortField: string = '', @Query('order') order: string = '') {

        var prepareFilter:any = {
            id: Number(id),
            isActive,
            title,
            description,
            grades, 
            brandIds, 
            typesPackagingIds,
            minPrice, 
            maxPrice,
            inStock,
            compound,
            sort: {sortField, order},
            page: Number(page), 
            limitPage: Number(limitPage)
        };

        if(minVolume && maxVolume && isNumeric(minVolume) && isNumeric(maxVolume)) {
            prepareFilter.volume = { minVolume: parseInt(minVolume), maxVolume: parseInt(maxVolume) }
        }

        if(minFortress && maxFortress && isNumeric(minFortress) && isNumeric(maxFortress)) {
            prepareFilter.fortress = { minVolume: parseInt(minFortress), maxVolume: parseInt(maxFortress) }
        }

        if(forBottling) {
            prepareFilter.forBottling = forBottling === 'true' ? true : false;
        }

        if(filtered) {
            prepareFilter.filtered = filtered === 'true' ? true : false;
        }
        
        return this.beerService.getListByFilter(prepareFilter);
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
    update(@Body() dto: UpdateBeerDto, @UploadedFile() image: BinaryData) {
        const id = Number(dto.id);
        delete dto.id;
        return this.beerService.update(id, dto, image);
    }

    @Delete('/remove/:id')
    remove(@Param('id') id: string) {
        return this.beerService.remove(id);
    }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { SnacksService } from './snacks.service';
import { CreateSnackDto } from './dto/create-snack.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductsService } from 'src/products/products.service';
import { isNumber } from 'src/helpers/typesHelper';

@Controller('snacks')
export class SnacksController {
    constructor(private readonly snacksService: SnacksService, private readonly productService: ProductsService) { }

    @Post('/create')
    @UseInterceptors(FileInterceptor('image'))
    createSnack(@Body() createSnackDto: CreateSnackDto, @UploadedFile() image) {
        return this.snacksService.create(createSnackDto, image);
    }

    @Post('/update')
    @UseInterceptors(FileInterceptor('image'))
    update(@Body() updateSnackDto: UpdateSnackDto, @UploadedFile() image: BinaryData) {
        const id = updateSnackDto.id;
        delete updateSnackDto.id;
        return this.snacksService.update(id, updateSnackDto, image);
    }

    @Get()
    getAll(@Query('page') page: string, @Query('limitPage') limitPage: string) {
        return this.snacksService.getList(Number(page), Number(limitPage));
    }

    @Get('getById/:id')
    getById(@Param('id') id: string) {
        if(isNumber(id)) {
            return this.snacksService.getByProductId(Number(id));
        }
        
        throw new HttpException('Параметр id не является числом', HttpStatus.BAD_REQUEST);
    }

    @Get('/getListByFilter')
    getListByFilter(@Query('id') id: string, @Query('title') title: string, @Query('isActive') isActive: string,
    @Query('description') description: string, @Query('brandIds') brandIds: string[], @Query('typesPackagingIds') typesPackagingIds: string[],
    @Query('minPrice') minPrice: number, @Query('maxPrice') maxPrice: number, @Query('sortField') sortField: string = '', @Query('order') order: string = '',
    @Query('page') page: string, @Query('limitPage') limitPage: string) {

        let sort: any = {sortField: 'price', order: 'ASC'};
        const prepareFilter: any = {
            id,
            isActive,
            title,
            description,
            brandIds,
            typesPackagingIds, 
            minPrice, 
            maxPrice
        };

        if(sortField && order) {
            sort = {sortField, order};
        }
      
        return this.snacksService.getListByFilter(prepareFilter, sort, Number(page), Number(limitPage));
    }

    @Get('/search')
    search(@Query('q') q: string, @Query('page') page: string, @Query('limitPage') limitPage: string, 
        @Query('sortField') sortField: string = '', @Query('order') order: string = '') {
        const findQuery = (query) => {return this.snacksService.findAndCountAll(query)};
        return this.productService.searchByName(q, Number(page), Number(limitPage), findQuery, {sortField, order});
    }
}

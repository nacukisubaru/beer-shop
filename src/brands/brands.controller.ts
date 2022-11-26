import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus } from '@nestjs/common';
import { isNumber } from 'src/helpers/typesHelper';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brands')
export class BrandsController {
    
    constructor(private readonly brandsService: BrandsService) {
    }

    @Post('/create')
    create(@Body() createBrandDto: CreateBrandDto) {
        return this.brandsService.create(createBrandDto);
    }

    @Get()
    findAll() {
        return this.brandsService.findAll();
    }

    @Get('/getByProductType/:type')
    getByProductType(@Param('type') type: string) {
       return this.brandsService.getByProductType(type);
    }

    @Get('/getById/:id')
    getById(@Param('id') id: string) {
        return this.brandsService.getById(+id);
    }

    @Post('/update')
    update(@Body() updateBrandDto: UpdateBrandDto) {
        const id = updateBrandDto.id;
        if(id && isNumber(id)) {
            delete updateBrandDto.id;
            return this.brandsService.update(+id, updateBrandDto);
        }

        throw new HttpException('Параметр id не был передан', HttpStatus.BAD_REQUEST);
    }

    @Delete('/remove/:id')
    remove(@Param('id') id: string) {
        return this.brandsService.remove(+id);
    }

    @Get('/getListPagination')
    getListPagination(
        @Query('page') page: string, 
        @Query('limitPage') limitPage: string,
        @Query('name') name: string,
        @Query('id') id: string,
        @Query('sortField') sortField: string, @Query('order') order: string
    ) {
        const filter: any = {};

        if(name) {
            filter.name = name;
        }

        if(id && isNumber(id)) {
            filter.id = Number(id);
        }

        return this.brandsService.getList(Number(page), Number(limitPage), filter, { sortField, order });
    }

}

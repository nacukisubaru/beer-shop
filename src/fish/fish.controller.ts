import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, HttpException, Query, HttpStatus } from '@nestjs/common';
import { FishService } from './fish.service';
import { CreateFishDto } from './dto/create-fish.dto';
import { UpdateFishDto } from './dto/update-fish.dto';
import { Roles } from 'src/token/roles-auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { RolesGuard } from 'src/token/roles.guard';
import { isNumber } from 'src/helpers/typesHelper';
import { ProductsService } from 'src/products/products.service';

@Controller('fish')
export class FishController {
    constructor(
        private readonly fishService: FishService, 
        private readonly productService: ProductsService
    ) {}

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Post('/create')
    @UseInterceptors(FileInterceptor('image'))
    create(@Body() createFishDto: CreateFishDto, @UploadedFile() image) {
        return this.fishService.create(createFishDto, image);
    }

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Post('/update')
    @UseInterceptors(FileInterceptor('image'))
    update(@Body() updateFishDto: UpdateFishDto, @UploadedFile() image: BinaryData) {
        return this.fishService.update(updateFishDto.id, updateFishDto, image);
    }

    @Get('getById/:id')
    getById(@Param('id') id: string) {
        if(isNumber(id)) {
            return this.fishService.getByProductId(Number(id));
        }
        
        throw new HttpException('Параметр id не является числом', HttpStatus.BAD_REQUEST);
    }

    @Get('/getListByFilter')
    getListByFilter(
        @Query('id') id: string, 
        @Query('title') title: string, 
        @Query('isActive') isActive: string,
        @Query('description') description: string,
        @Query('fishTypeId') fishTypeId: string,
        @Query('brandIds') brandIds: string[],
        @Query('fishTypes') fishTypes: string[],
        @Query('typesPackagingIds') typesPackagingIds: string[],
        @Query('minPrice') minPrice: number, @Query('maxPrice') maxPrice: number, 
        @Query('sortField') sortField: string = '', @Query('order') order: string = '',
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
            maxPrice,
            fishTypeId,
            fishTypes
        };

        if(sortField && order) {
            sort = {sortField, order};
        }
      
        return this.fishService.getListByFilter(prepareFilter, sort, Number(page), Number(limitPage));
    }

    @Get('/search')
    search(@Query('q') q: string, @Query('page') page: string, @Query('limitPage') limitPage: string, 
        @Query('sortField') sortField: string = '', @Query('order') order: string = '') {
        const findQuery = (query) => {return this.fishService.findAndCountAll(query)};
        return this.productService.searchByName(q, Number(page), Number(limitPage), findQuery, {sortField, order});
    }

}
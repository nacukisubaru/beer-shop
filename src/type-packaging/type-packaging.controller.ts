import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { TypePackagingService } from './type-packaging.service';
import { CreateTypePackagingDto } from './dto/create-type-packaging.dto';
import { isNumber } from 'src/helpers/typesHelper';
import { UpdateTypePackagingDto } from './dto/update-type-packaging.dto';
import { RolesGuard } from 'src/token/roles.guard';
import { Roles } from 'src/token/roles-auth.decorator';
@Controller('type-packaging')
export class TypePackagingController {
    constructor(private readonly typePackagingService: TypePackagingService) { }

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Post('/create')
    create(@Body() createTypePackagingDto: CreateTypePackagingDto) {
        return this.typePackagingService.create(createTypePackagingDto);
    }

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Post('/update')
    update(@Body() updateTypePackagingDto: UpdateTypePackagingDto) {
        const id = updateTypePackagingDto.id;
        if(id && isNumber(id)) {
            delete updateTypePackagingDto.id;
            return this.typePackagingService.update(+id, updateTypePackagingDto);
        }

        throw new HttpException('Параметр id не был передан', HttpStatus.BAD_REQUEST);
    }
    
    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Delete('/remove/:id')
    remove(@Param('id') id: string) {
        return this.typePackagingService.remove(+id);
    }

    @Get('/getListByProductType/:type')
    getListByProductType(@Param('type') productType: string) {
        return this.typePackagingService.getListByProductType(productType);
    }

    @Get('/getById/:id')
    getById(@Param('id') id: string) {
        return this.typePackagingService.getById(+id);
    }

    @Get('/getListPagination')
    getListPagination(
        @Query('page') page: string,
        @Query('limitPage') limitPage: string,
        @Query('name') name: string,
        @Query('id') id: string,
        @Query('productTypeId') productTypeId: string,
        @Query('sortField') sortField: string, @Query('order') order: string
    ) {
        const filter: any = {};

        if (name) {
            filter.name = name;
        }

        if (id && isNumber(id)) {
            filter.id = Number(id);
        }

        if (productTypeId && isNumber(productTypeId)) {
            filter.productTypeId = Number(productTypeId);
        }

        return this.typePackagingService.getList(Number(page), Number(limitPage), filter, { sortField, order });
    }
}

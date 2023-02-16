import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { FishTypesService } from './fish-types.service';
import { CreateFishTypeDto } from './dto/create-fish-type.dto';
import { UpdateFishTypeDto } from './dto/update-fish-type.dto';
import { isNumber } from 'src/helpers/typesHelper';
import { RolesGuard } from 'src/token/roles.guard';
import { Roles } from 'src/token/roles-auth.decorator';

@Controller('fish-types')
export class FishTypesController {
    constructor(private readonly fishTypesService: FishTypesService) { }

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Post('/create')
    create(@Body() createFishTypeDto: CreateFishTypeDto) {
        return this.fishTypesService.create(createFishTypeDto);
    }

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Post('/update')
    update(@Body() updateFishTypeDto: UpdateFishTypeDto) {
        return this.fishTypesService.update(updateFishTypeDto);
    }

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Delete('/remove/:id')
    remove(@Param('id') id: string) {
        return this.fishTypesService.remove(+id);
    }

    @Get('/getById/:id')
    getById(@Param('id') id: string) {
        return this.fishTypesService.getById(+id);
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

        if (name) {
            filter.name = name;
        }

        if (id && isNumber(id)) {
            filter.id = Number(id);
        }

        return this.fishTypesService.getListPagination(parseInt(page), parseInt(limitPage), filter, { sortField, order });
    }

    @Get('/getList')
    getList() {
        return this.fishTypesService.getList();
    }
}

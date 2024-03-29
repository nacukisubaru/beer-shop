import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, Query, UseGuards } from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { ValidationPipe } from '../pipes/validation.pipe';
import { isNumber } from 'src/helpers/typesHelper';
import { Roles } from 'src/token/roles-auth.decorator';
import { RolesGuard } from 'src/token/roles.guard';

@Controller('grades')
export class GradesController {
    constructor(private readonly gradesService: GradesService) { }

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @UsePipes(ValidationPipe)
    @Post('/create')
    create(@Body() createGradeDto: CreateGradeDto) {
        return this.gradesService.create(createGradeDto);
    }

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @UsePipes(ValidationPipe)
    @Post('/update')
    update(@Body() updateGradeDto: UpdateGradeDto) {
        const id = updateGradeDto.id;
        delete updateGradeDto.id;
        return this.gradesService.update(id, updateGradeDto);
    }

    @Get('/getById/:id')
    getById(@Param('id') id: number) {
        return this.gradesService.findById(id);
    }

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Delete('/remove/:id')
    remove(@Param('id') id: number) {
        return this.gradesService.remove(id);
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

        return this.gradesService.getList(Number(page), Number(limitPage), filter, { sortField, order });
    }

    @Get('/getList')
    findAll() {
        return this.gradesService.findAll();
    }
}

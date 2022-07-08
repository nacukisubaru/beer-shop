import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { ValidationPipe } from '../pipes/validation.pipe';

@Controller('grades')
export class GradesController {
    constructor(private readonly gradesService: GradesService) { }


    @UsePipes(ValidationPipe)
    @Post('/create')
    create(@Body() createGradeDto: CreateGradeDto) {
        return this.gradesService.create(createGradeDto);
    }
    
    @UsePipes(ValidationPipe)
    @Post('/update')
    update(@Body() updateGradeDto: UpdateGradeDto) {
        const id = updateGradeDto.id;
        delete updateGradeDto.id;
        return this.gradesService.update(id, updateGradeDto);
    }

    @Delete('/remove/:id')
    remove(@Param('id') id: string) {
        return this.gradesService.remove(id);
    }

    @Get()
    findAll() {
        return this.gradesService.findAll();
    }
}

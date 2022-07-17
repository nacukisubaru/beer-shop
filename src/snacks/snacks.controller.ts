import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SnacksService } from './snacks.service';
import { CreateSnackDto } from './dto/create-snack.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';

@Controller('snacks')
export class SnacksController {
    constructor(private readonly snacksService: SnacksService) { }

    @Post('/create')
    createSnack(@Body() createSnackDto: CreateSnackDto) {
        return this.snacksService.create(createSnackDto);
    }

    @Post('/update')
    update(@Body() updateSnackDto: UpdateSnackDto) {
        const id = updateSnackDto.id;
        delete updateSnackDto.id;
        return this.snacksService.update(id, updateSnackDto);
    }

    @Get()
    getAll(@Query('page') page: string) {
        return this.snacksService.getList(Number(page));
    }

    @Get(':id')
    getById(@Param('id') id: string) {
        return this.snacksService.getById(+id);
    }
}
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

    @Get()
    getAll(@Query('page') page: string) {
        return this.snacksService.getList(Number(page));
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.snacksService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSnackDto: UpdateSnackDto) {
        return this.snacksService.update(+id, updateSnackDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.snacksService.remove(+id);
    }
}

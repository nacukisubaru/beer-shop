import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { SnacksService } from './snacks.service';
import { CreateSnackDto } from './dto/create-snack.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('snacks')
export class SnacksController {
    constructor(private readonly snacksService: SnacksService) { }

    @Post('/create')
    @UseInterceptors(FileInterceptor('image'))
    createSnack(@Body() createSnackDto: CreateSnackDto, @UploadedFile() image) {
        return this.snacksService.create(createSnackDto, image);
    }

    @Post('/update')
    update(@Body() updateSnackDto: UpdateSnackDto) {
        const id = updateSnackDto.id;
        delete updateSnackDto.id;
        return this.snacksService.update(id, updateSnackDto);
    }

    @Get()
    getAll(@Query('page') page: string, @Query('limitPage') limitPage: string) {
        return this.snacksService.getList(Number(page), Number(limitPage));
    }

    @Get('getById/:id')
    getById(@Param('id') id: string) {
        return this.snacksService.getById(+id);
    }

    @Get('/getListByFilter')
    getListByFilter(@Query('brandIds') brandIds: number[], @Query('typesPackagingIds') typesPackagingIds: number[],
        @Query('minPrice') minPrice: number, @Query('maxPrice') maxPrice: number, @Query('sort') sort: [string, string],
        @Query('page') page: string, @Query('limitPage') limitPage: string) {
        return this.snacksService.getListByFilter(
            brandIds, 
            typesPackagingIds, 
            minPrice, 
            maxPrice,
            sort,
            Number(page), 
            Number(limitPage)
        );
    }

    @Get('/search')
    search(@Query('q') q: string, @Query('page') page: string, @Query('limitPage') limitPage: string, @Query('sort') sort: [string, string]) {
        return this.snacksService.searchByName(q, Number(page), Number(limitPage), sort);
    }

    @Get('/addShow/:id')
    addShow(@Param('id') id: string) {
        this.snacksService.addShow(Number(id));
    }
}

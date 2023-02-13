import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FishTypesService } from './fish-types.service';
import { CreateFishTypeDto } from './dto/create-fish-type.dto';
import { UpdateFishTypeDto } from './dto/update-fish-type.dto';

@Controller('fish-types')
export class FishTypesController {
    constructor(private readonly fishTypesService: FishTypesService) { }

    @Post()
    create(@Body() createFishTypeDto: CreateFishTypeDto) {
        return this.fishTypesService.create(createFishTypeDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateFishTypeDto: UpdateFishTypeDto) {
        return this.fishTypesService.update(+id, updateFishTypeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.fishTypesService.remove(+id);
    }

    @Get('/getList')
    getList() {
        return this.fishTypesService.getList();
    }
}

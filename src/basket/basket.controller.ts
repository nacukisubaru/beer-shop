import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { BasketService } from './basket.service';
import { CreateBasketDto } from './dto/create-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';

@Controller('basket')
export class BasketController {
    constructor(private readonly basketService: BasketService) { }

    @UsePipes(ValidationPipe)
    @Post('/addProduct')
    addProduct(@Body() createBasketDto: CreateBasketDto) {
        return this.basketService.addProduct(createBasketDto);
    }

    @Get()
    getList() {
        return this.basketService.getList();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.basketService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBasketDto: UpdateBasketDto) {
        return this.basketService.update(+id, updateBasketDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.basketService.remove(+id);
    }
}
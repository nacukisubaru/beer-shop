import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { BasketService } from './basket.service';
import { CreateBasketDto } from './dto/create-basket.dto';
import { RemoveProductBasketDto } from './dto/remove-product-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';

@Controller('basket')
export class BasketController {
    constructor(private readonly basketService: BasketService) { }

    @UsePipes(ValidationPipe)
    @Post('/addProduct')
    addProduct(@Body() createBasketDto: CreateBasketDto) {
        return this.basketService.addProduct(createBasketDto);
    }

    @Post('/updProduct')
    updateProduct(@Body() updateBasketDto: UpdateBasketDto) {
        return this.basketService.updateProduct(updateBasketDto);
    }

    @Post('/removeProduct')
    removeProduct(@Body() removeProductDto: RemoveProductBasketDto) {
        return this.basketService.removeProduct(removeProductDto);
    }

    @Get('/freeBasket/:id')
    getFreeBasketByUser(@Param('id') userId: string) {
        return this.basketService.getFreeBasketByUser(Number(userId));
    }

    @Get()
    getList() {
        return this.basketService.getList();
    }
}

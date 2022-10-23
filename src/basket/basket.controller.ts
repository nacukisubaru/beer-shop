import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/token/jwt-auth.guard';
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

    @UseGuards(JwtAuthGuard)
    @Get('/freeBasket/:id')
    getFreeBasketByUser(@Param('id') userId: string) {
        return this.basketService.getFreeBasketByUser(Number(userId));
    }

    @UseGuards(JwtAuthGuard)
    @Get('/poolingBaskets/')
    poolingBaskets(@Query('basketId') basketId: string, @Req() request) {
        const userId = request.user.id;
        return this.basketService.poolingBaskets(Number(basketId), userId);
    }

    @Get()
    getList() {
        return this.basketService.getList();
    }

    @Get('/getBasket/:id')
    getBasket(@Param('id') id: string) {
        return this.basketService.getById(Number(id));
    }
}

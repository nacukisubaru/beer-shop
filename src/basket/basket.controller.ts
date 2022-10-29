import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/token/jwt-auth.guard';
import { BasketService } from './basket.service';
import { CreateBasketDto } from './dto/create-basket.dto';
import { GetBasketDto } from './dto/get-basket.dto';
import { RemoveProductBasketDto } from './dto/remove-product-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';

@Controller('basket')
export class BasketController {
    constructor(private readonly basketService: BasketService) { }

    @UsePipes(ValidationPipe)
    @Post('/addProduct')
    addProduct(@Body() createBasketDto: CreateBasketDto) {
        return this.basketService.addProduct(createBasketDto, 0);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/addProductByUser')
    addProductByUser(@Body() createBasketDto: CreateBasketDto, @Req() request) {
        const userId = request.user.id;
        return this.basketService.addProduct(createBasketDto, userId);
    }

    @Post('/updProduct')
    updateProduct(@Body() updateBasketDto: UpdateBasketDto) {
        return this.basketService.updateProduct(updateBasketDto);
    }

    @Post('/removeProduct')
    removeProduct(@Body() removeProductDto: RemoveProductBasketDto) {
        return this.basketService.removeProduct([removeProductDto.productId], removeProductDto.hash);
    }

    @UseGuards(JwtAuthGuard)
    @Post('/freeBasket/')
    getFreeBasketByUser(@Body() getBasketDto: GetBasketDto, @Req() request) {
        const userId = request.user.id;
        return this.basketService.getBasketByUserAndPoolingBaskets(getBasketDto.hash, Number(userId));
    }

    @Post('/getBasket')
    getBasket(@Body() getBasketDto: GetBasketDto) {
        return this.basketService.getBasketByHash(getBasketDto.hash);
    }

    // @Get()
    // getList() {
    //     return this.basketService.getList();
    // }
}

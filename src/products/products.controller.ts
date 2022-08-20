import { Body, Controller, Get, Param, Post, Query, UsePipes } from '@nestjs/common';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { ActivateProductDto } from './dto/activate-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {

    constructor(private productService: ProductsService) {}

    @Get()
    getList() {
        return this.productService.getAll();
    }

    @Get('/brand/:id')
    getListByBrand(@Param('id') brandId: string) {
        return this.productService.getListByBrand(Number(brandId));
    }

    @UsePipes(ValidationPipe)
    @Post('/switchActive')
    switchActivate(@Body() dto: ActivateProductDto) {
        return this.productService.switchActive(dto.id, dto.isActive);
    }

    @Get('/minMaxPrices/')
    getMixAndMaxPrice(@Query('productType') type: string) {
        return this.productService.getMinAndMaxPrice(type);
    }

}

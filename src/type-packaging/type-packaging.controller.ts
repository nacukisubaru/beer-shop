import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TypePackagingService } from './type-packaging.service';
import { CreateTypePackagingDto } from './dto/create-type-packaging.dto';

@Controller('type-packaging')
export class TypePackagingController {
    constructor(private readonly typePackagingService: TypePackagingService) { }

    @Post('/create')
    create(@Body() createTypePackagingDto: CreateTypePackagingDto) {
        return this.typePackagingService.create(createTypePackagingDto);
    }

    @Get('/getListByProductType/:type')
    getListByProductType(@Param('type') productType: string) {
        return this.typePackagingService.getListByProductType(productType);
    }
}

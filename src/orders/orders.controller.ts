import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @Get()
    getList() {
        return this.ordersService.getOrdersWithProducts();
    }

    @Get('/getByUser/:userId')
    getListByUserId(@Param('userId') userId: string) {
        return this.ordersService.getOrdersWithProducts(Number(userId));
    }

    @Get(':id')
    getById(@Param('id') id: string) {
        return this.ordersService.getOrderWithProduct(Number(id));
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.ordersService.update(+id, updateOrderDto);
    }
}

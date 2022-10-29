import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/token/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }
    
    @UseGuards(JwtAuthGuard)
    @Post('/create')
    create(@Body() createOrderDto: CreateOrderDto, @Req() request) {
        const userId = request.user.id;
        return this.ordersService.create(createOrderDto.basketHash, userId);
    }

    @Get()
    getList() {
        return this.ordersService.getOrdersWithProducts();
    }

    @Get('/users/:id')
    getListByUserId(@Param('id') userId: string) {
        return this.ordersService.getOrdersWithProducts({userId});
    }

    @Get('/delivery/:id')
    getListByDeliveryId(@Param('id') deliveryId: string) {
        return this.ordersService.getOrdersWithProducts({deliveryId});
    }

    @Get('/paymentMetods/:id')
    getListByPaymentMethod(@Param('id') paymentMethodId: string) {
        return this.ordersService.getOrdersWithProducts({paymentMethodId});
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

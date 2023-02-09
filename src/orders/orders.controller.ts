import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/token/jwt-auth.guard';
import { defaultLimitPage } from 'src/helpers/paginationHelper';
import { Roles } from 'src/token/roles-auth.decorator';
import { RolesGuard } from 'src/token/roles.guard';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }
    
    @UseGuards(JwtAuthGuard)
    @Post('/create')
    create(@Body() createOrderDto: CreateOrderDto, @Req() request) {
        const userId = request.user.id;
        return this.ordersService.create(createOrderDto.basketHash, userId);
    }

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @Get()
    getList(
        @Query('page') page: string, 
        @Query('limitPage') limitPage: number,
        @Query('orderId') orderId: number,
        @Query('userId') userId: number,
        @Query('customerFio') customerFio: string,
        @Query('customerPhone') customerPhone: string,
        @Query('sortField') sortField: string, @Query('order') order: string
    ) {
        const filter: any = {};
        if(!limitPage) {
            limitPage = defaultLimitPage;
        }

        if(customerFio) {
            filter.customerFio = customerFio;
        }

        if(customerPhone) {
            filter.customerPhone = customerPhone;
        }

        if(orderId) {
            filter.id = orderId;
        }

        if(userId) {
            filter.userId = userId;
        }

        return this.ordersService.getOrdersWithProducts(Number(page), Number(limitPage), filter, { sortField, order });
    }

    @Get('/users/:id')
    getListByUserId(@Param('id') userId: string) {
       // return this.ordersService.getOrdersWithProducts({userId});
    }

    @Get('/delivery/:id')
    getListByDeliveryId(@Param('id') deliveryId: string) {
        //return this.ordersService.getOrdersWithProducts({deliveryId});
    }

    @Get('/paymentMetods/:id')
    getListByPaymentMethod(@Param('id') paymentMethodId: string) {
        //return this.ordersService.getOrdersWithProducts({paymentMethodId});
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

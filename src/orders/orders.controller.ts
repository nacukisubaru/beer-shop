import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, Query, UsePipes, ValidationPipe } from '@nestjs/common';
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
        @Query('statusId') statusId: number,
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

        if(statusId) {
            filter.statusId = statusId;
        }

        if(orderId) {
            filter.id = orderId;
        }

        if(userId) {
            filter.userId = userId;
        }

        return this.ordersService.getOrdersWithProducts(Number(page), Number(limitPage), filter, { sortField, order });
    }

    @UseGuards(JwtAuthGuard)
    @Get('/user/:id')
    getListByUserId(
        @Query('page') page: string, 
        @Query('limitPage') limitPage: number,
        @Query('sortField') sortField: string, @Query('order') order: string,
        @Req() request
    ) {
        const filter: any = {};
        const userId: number = request.user.id;
        if(userId) {
            filter.userId = userId;
        }

        return this.ordersService.getOrdersWithProducts(Number(page), Number(limitPage), filter, { sortField, order });
    }

    @Get(':id')
    getById(@Param('id') id: string) {
        return this.ordersService.getOrderWithProduct(Number(id));
    }

    @Roles("ADMIN")
    @UseGuards(RolesGuard)
    @UsePipes(ValidationPipe)
    @Post('/update/')
    update(@Body() updateOrderDto: UpdateOrderDto) {
        return this.ordersService.update(updateOrderDto);
    }
}

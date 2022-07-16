import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { response } from 'express';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('/registration')
    async registration(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) response) {
        const userData = await this.usersService.registrate(createUserDto);
        const maxAge = 30 * 24 * 60 * 60 * 1000;
        response.cookie('refreshToken', userData.refreshToken, {maxAge, httpOnly: true});
        return response.json(userData);
    }

    @Post('/login')
    login(@Body() authUserDto: AuthUserDto) {
        return this.usersService.login(authUserDto);
    }

    //не работает доделать
    @Post('/logout')
    logout(@Req() request, @Res() response) {
        const {refreshToken} = request.cookies;
        const token = this.usersService.logout(refreshToken);
        response.clearCookie('refreshToken');
        return response.json(token);
    }

    @Get('/refresh/')
    async refresh(@Request() request) {
        console.log(request);
        // try {
        //     const {refreshToken} = request.cookies;
        //     const userData = await this.usersService.refresh(refreshToken);
        //     if(userData) {
        //         const maxAge = 30 * 24 * 60 * 60 * 1000;
        //         response.cookie('refreshToken', userData.refreshToken, {maxAge, httpOnly: true});
        //     }

        //     return response.json(userData);
        // } catch(e) {
        //     console.log(e);
        // }
    }

    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    getById(@Param('id') id: string) {
        return this.usersService.getById(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}

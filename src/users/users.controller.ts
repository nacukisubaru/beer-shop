import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
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
        console.log(request);
        const {refreshToken} = request.cookies;
        const token = this.usersService.logout(refreshToken);
        response.clearCookie('refreshToken');
        return response.json(token);
    }

    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
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

import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { response } from 'express';
import { setCookiesRefreshToken } from 'src/helpers/cookiesHelper';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('/registration')
    async registration(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) response) {
        const userData = await this.usersService.registrate(createUserDto);
        return setCookiesRefreshToken(response, userData);
    }

    @Post('/login')
    async login(@Body() authUserDto: AuthUserDto, @Res({ passthrough: true }) response) {
        const userData = await this.usersService.login(authUserDto);
        return setCookiesRefreshToken(response, userData);
    }

    @Post('/logout')
    logout(@Req() request, @Res() response) {
        const {refreshToken} = request.cookies;
        const token = this.usersService.logout(refreshToken);
        response.clearCookie('refreshToken');
        return response.json(token);
    }

    @Get('/refresh/')
    async refresh(@Req() request) {
       console.log(request.cookies);
       try {
           const {refreshToken} = request.cookies;
           console.log(refreshToken);
           const userData = await this.usersService.refresh(refreshToken);
           console.log(userData);
           return setCookiesRefreshToken(response, userData);
       } catch(e) {
           console.log(e);
            return false;
       }
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

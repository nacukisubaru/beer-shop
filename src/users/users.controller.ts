import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Request, UnauthorizedException, Ip } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { response } from 'express';
import { setCookiesRefreshToken } from 'src/helpers/cookiesHelper';
import { AuthUserByCodeDto } from './dto/auth-user-by-code.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('/registration')
    async registration(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) response, @Ip() ip: string) {
        const userData = await this.usersService.registrate(createUserDto, ip);
        setCookiesRefreshToken(response, userData);
        return userData;
    }

    @Post('/login')
    async login(@Body() authUserDto: AuthUserDto, @Res({ passthrough: true }) response) {
        const userData = await this.usersService.login(authUserDto);
        setCookiesRefreshToken(response, userData);
        return userData;
    }

    @Post('/loginByCode')
    async loginByCode(@Body() authUserDto: AuthUserByCodeDto, @Res({ passthrough: true }) response) {
        const userData = await this.usersService.loginByCode(authUserDto);
        setCookiesRefreshToken(response, userData);
        return userData;
    }

    @Post('/logout')
    logout(@Req() request, @Res({ passthrough: true }) response) {
        const {refreshToken} = request.cookies;
        this.usersService.logout(refreshToken);
        response.clearCookie('refreshToken');
        return true;
    }

    @Get('/refresh/')
    async refresh(@Req() request, @Res({ passthrough: true }) response) {
       try {
           const {refreshToken} = request.cookies;
           const userData = await this.usersService.refresh(refreshToken);
           setCookiesRefreshToken(response, userData);
           return userData;
       } catch(e) {
            throw new UnauthorizedException();
       }
    }

    @Get('/activate/:id')
    activate(@Param('id') activationLink: string) {
       return this.usersService.activate(activationLink);
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

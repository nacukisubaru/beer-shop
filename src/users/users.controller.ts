import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req, Request, UnauthorizedException, Ip, Query, UsePipes, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { response } from 'express';
import { setCookiesRefreshToken } from 'src/helpers/cookiesHelper';
import { AuthUserByCodeDto } from './dto/auth-user-by-code.dto';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { ChangeNumberDto } from './dto/change-number.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { ChangeFioDto } from './dto/change-fio.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyUserByCodeDto } from './dto/verify-user-by-code.dto';
import { JwtAuthGuard } from 'src/token/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('/registration')
    async registration(@Body() createUserDto: CreateUserDto, @Res({ passthrough: true }) response) {
        return await this.usersService.registrate(createUserDto);
        //setCookiesRefreshToken(response, userData);
        //return userData;
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

    @Get('/checkUserExistByPhone/')
    async checkUserExistByPhone(@Query('phone') phone: string) {
       return await this.usersService.checkUserExistByPhone(phone);
    }

    @Get('/checkUserNotExistByPhone/')
    async checkUserNotExistByPhone(@Query('phone') phone: string) {
       return await this.usersService.checkUserNotExistByPhone(phone);
    }

    @Get('/checkUserNotExistByEmailAndPhone/')
    async checkUserNotExistByEmailAndPhone(@Query('phone') phone: string, @Query('email') email: string) {
        const result = await this.usersService.checkUserNotExistByEmailAndPhone(phone, email);
        return {result};
    }

    @UsePipes(ValidationPipe)
    @Post('/verifyUserByCode')
    async verifyByCode(@Body() verifyDto: VerifyUserByCodeDto) {
       return await this.usersService.verifyUserByCode(verifyDto.phone, verifyDto.code);
    }

    @UsePipes(ValidationPipe)
    @Post('/verifyPhoneByCode')
    async verifyPhoneByCode(@Body() verifyDto: VerifyUserByCodeDto) {
       return await this.usersService.verifyPhoneByCode(verifyDto.phone, verifyDto.code);
    }
   
    @Get('/activate/:id')
    activate(@Param('id') activationLink: string) {
       return this.usersService.activate(activationLink);
    }

    @UseGuards(JwtAuthGuard)
    @UsePipes(ValidationPipe)
    @Post('/changePhone')
    async changePhoneNumber(@Body() numberData: ChangeNumberDto, @Req() request) {
        const userId = request.user.id;
        return this.usersService.changePhoneNumber(parseInt(userId), numberData.phone);
    }

    @UsePipes(ValidationPipe)
    @Post('/changeEmail')
    async changeEmail(@Body() emailData: ChangeEmailDto, @Req() request) {
        const userId = request.user.id;
        return this.usersService.changeEmail(parseInt(userId), emailData.email);
    }

    @UsePipes(ValidationPipe)
    @Post('/changeFio')
    async changeFio(fioData: ChangeFioDto, @Req() request) {
        const userId = request.user.id;
        return this.usersService.changeFio(parseInt(userId), fioData.name, fioData.surname);
    }

    @UsePipes(ValidationPipe)
    @Post('/changePassword')
    async changePassword(passwordData: ChangePasswordDto, @Req() request) {
        const userId = request.user.id;
        return this.usersService.changePassword(parseInt(userId), passwordData.password);
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

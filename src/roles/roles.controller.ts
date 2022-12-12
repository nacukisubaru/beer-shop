import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/token/jwt-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
    constructor(private roleService: RolesService) {}

    @UseGuards(JwtAuthGuard)
    @Get('/hasRoleAdmin')
    checkUserHasRoleAdmin(@Req() request) {
        const userId = request.user.id;
        return this.roleService.userHasRole(userId, ["ADMIN"]);
    }
}

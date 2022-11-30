import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BindRoleDto } from './dto/bind-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './roles.model';
import { UserRoles } from './user-roles.model';

@Injectable()
export class RolesService {

    constructor(
        @InjectModel(Role) private roleRepo: typeof Role,
        @InjectModel(UserRoles) private userRolesRepo: typeof UserRoles,
    ) { }

    async createRole(dto: CreateRoleDto) {
        return await this.roleRepo.create(dto);
    }

    async getRoleByValue(value: string) {
        return await this.roleRepo.findOne({ where: { value } });
    }

    async getRolesByValues(value: string[]) {
        return await this.roleRepo.findAll({ where: { value } });
    }

    async getRolesByIds(ids: number[]) {
        return await this.roleRepo.findAll({ where: { id: ids } });
    }

    async bindRole(dto: BindRoleDto) {
        const role = await this.getRoleByValue(dto.role);
        if (!role) {
            throw new HttpException(`Роль по значению ${dto.role} не найдена`, HttpStatus.BAD_REQUEST);
        }

        return await this.userRolesRepo.create({ ...dto, roleId: role.id, id:dto.userId });
    }

    async userHasRole(userId: number, roleValue: string[]) {
        const roles = await this.userRolesRepo.findAll({where: {userId}, include: {all:true}});
        if(!roles.length) {
            return false;
        }
        const rolesIds = roles.map((role) => role.roleId);
        const rolesByValue = await this.getRolesByValues(roleValue);
        if(!rolesByValue.length) {
            return false;
        }
        
        const userHasAllRoles = rolesByValue.some((role) => rolesIds.includes(role.id));
        return userHasAllRoles;
    }

    async getRolesByUserId(userId: number) {
      const roles = await this.userRolesRepo.findAll({where:{userId}, include:{all:true}});
      const rolesIds = roles.map((role) => role.roleId);
      return await this.getRolesByIds(rolesIds)
    }

}

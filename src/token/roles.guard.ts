import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { RolesService } from "src/roles/roles.service";
import { ROLES_KEY } from "./roles-auth.decorator";
import { TokenService } from "./token.service";

@Injectable()
export class RolesGuard implements CanActivate {
    private forbiddenMessage: string = 'Нет доступа';

    constructor(
        private reflector: Reflector,
        private tokenService: TokenService,
        private rolesService: RolesService
    ) {}

    async canActivate(context: ExecutionContext){
        
        try {
            //с помощью рефлектора получаем роли по ключу
            //getHandler служит для получения ссылки на обработчик(метод контроллера)
            //getClass служит для получения контроллера класса к которому принадлежит обработчик(метод контроллера)
            const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
                context.getHandler(),
                context.getClass()
            ]);

            if(!requiredRoles) {
                return true;
            }
        
            const req = context.switchToHttp().getRequest();
            const authHeader = req.headers.authorization;
            if(!authHeader) {
                return false;
            }
            const bearer = authHeader.split(' ')[0];
            const token = authHeader.split(' ')[1];
            if(bearer !== 'Bearer' || !token) {
                throw new HttpException(this.forbiddenMessage, HttpStatus.FORBIDDEN);
            }
     
            const user:any = await this.tokenService.validateAccessToken(token);
        
            const userHasRoleInToken = user.roles.some(role => requiredRoles.includes(role));
            const userHasRoleInDb = await this.rolesService.userHasRole(user.id, requiredRoles);
            if(!userHasRoleInToken || !userHasRoleInDb) {
                 return false;
            }
            return true;

        } catch (e) {
            throw new HttpException(this.forbiddenMessage, HttpStatus.FORBIDDEN);
        }
    }

}
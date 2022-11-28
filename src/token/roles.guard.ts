import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { ROLES_KEY } from "./roles-auth.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    private forbiddenMessage: string = 'Нет доступа';

    constructor(private jwtService: JwtService,
                private reflector: Reflector) {}

    canActivate(context: ExecutionContext):  boolean | Promise<boolean> | Observable<boolean> {
        
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
            const bearer = authHeader.split(' ')[0];
            const token = authHeader.split(' ')[1];

            if(bearer !== 'Bearer' || !token) {
                throw new HttpException(this.forbiddenMessage, HttpStatus.FORBIDDEN);
            }

            const user = this.jwtService.verify(token);
            req.user = user;
            //some проверяет удовлетворяет ли условию
            //есть ли роль пользователя среди ролей которые мы получаем из рефлектора
            return user.roles.some(role => requiredRoles.includes(role.value));
        } catch (e) {
            throw new HttpException(this.forbiddenMessage, HttpStatus.FORBIDDEN);
        }
    }

}
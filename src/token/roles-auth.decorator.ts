import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = 'roles';
//кастомный декоратор устанавливаем роли с определенным ключом
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
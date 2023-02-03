import { IsString } from "class-validator";
export class ChangePasswordDto {
    @IsString({message: 'Обязательное поле'})
    password: string;
}
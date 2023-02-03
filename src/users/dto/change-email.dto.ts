import { IsString } from "class-validator";
export class ChangeEmailDto {
    @IsString({message: 'Обязательное поле'})
    email: string;
}
import { IsString } from "class-validator";
export class VerifyUserByCodeDto {
    @IsString({message: 'Обязательное поле'})
    phone: string;

    @IsString({message: 'Обязательное поле'})
    code: string;
}
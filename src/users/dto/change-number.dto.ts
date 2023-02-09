import { IsString } from "class-validator";
export class ChangeNumberDto {
    @IsString({message: 'Обязательное поле'})
    phone: string;
}
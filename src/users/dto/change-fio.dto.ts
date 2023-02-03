import { IsString } from "class-validator";
export class ChangeFioDto {
    @IsString({message: 'Обязательное поле'})
    name: string;

    @IsString({message: 'Обязательное поле'})
    surname: string;
}
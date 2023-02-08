import { IsString } from "class-validator";
export class ChangeFioDto {
    @IsString({message: 'Обязательное поле'})
    fio: string;
}
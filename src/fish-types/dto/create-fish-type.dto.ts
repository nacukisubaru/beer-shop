import { IsString } from "class-validator";

export class CreateFishTypeDto {
    @IsString({message: 'Обязательное поле'})
    name: string
}
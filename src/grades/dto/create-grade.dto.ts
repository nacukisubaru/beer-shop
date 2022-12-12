import { IsString, Length, IsNumber } from "class-validator";
export class CreateGradeDto {
    @IsString({message: 'Должно быть строкой'})
    name: string;
    
    // @IsString({message: 'Должно быть строкой'})
    // code: string;
}

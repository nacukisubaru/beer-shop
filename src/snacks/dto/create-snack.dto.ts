import { IsNumber, IsString } from "class-validator";

export class CreateSnackDto {
    @IsString({message: 'Должно быть строкой'})
    title: string;

    @IsString({message: 'Должно быть строкой'})
    description: string;

    @IsNumber({}, {message: 'Должно быть числом'})
    price: number;

    @IsNumber({}, {message: 'Должно быть числом'})
    quantity: number;

    @IsNumber({}, {message: 'Должно быть числом'})
    weight: number;
    
    @IsNumber({}, {message: 'Должно быть числом'})
    brandId: number;

    typePackagingId:number;
    
    @IsString({message: 'Должно быть строкой'})
    isActive: string;
}

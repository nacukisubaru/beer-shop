import { IsNumber, IsString } from "class-validator";

export class CreateSnackDto {
    @IsString({message: 'Обязательное поле'})
    title: string;

    @IsString({message: 'Обязательное поле'})
    description: string;

    @IsString({message: 'Обязательное поле'})
    price: number;

    @IsString({message: 'Обязательное поле'})
    quantity: number;

    @IsString({message: 'Обязательное поле'})
    weight: number;
    
    @IsString({message: 'Обязательное поле'})
    brandId: number;

    @IsString({message: 'Обязательное поле'})
    typePackagingId:number;

    @IsString({message: 'Обязательное поле'})
    isActive: string;

    @IsString({message: 'Обязательное поле'})
    inStock: string; 
}

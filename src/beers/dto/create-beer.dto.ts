import { IsString, IsNumber, IsArray, IsNotEmptyObject } from "class-validator";
export class CreateBeerDto {
    
    @IsString({message: 'Обязательное поле'})
    compound: string;
    
    @IsString({message: 'Обязательное поле'})
    volume: number;

    @IsString({message: 'Обязательное поле'})
    fortress: number;

    @IsString({message: 'Обязательное поле'})
    ibu: number;

    @IsString({message: 'Обязательное поле'})
    title: string;

    @IsString({message: 'Обязательное поле'})
    description: string;

    @IsString({message: 'Обязательное поле'})
    price: number;

    @IsString({message: 'Обязательное поле'})
    quantity: number;
    
    @IsString({message: 'Обязательное поле'})
    brandId: number;
    
    @IsString({message: 'Обязательное поле'})
    typePackagingId: number;

    @IsArray()
   // @IsNotEmptyObject()
    gradeIds: number[];

    @IsString({message: 'Обязательное поле'})
    forBottling: string;
    
    @IsString({message: 'Обязательное поле'})
    filtered: string;

    @IsString({message: 'Обязательное поле'})
    isActive: string;
    
    @IsString({message: 'Обязательное поле'})
    inStock: string;
}
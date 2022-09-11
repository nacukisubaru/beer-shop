import { IsString, IsNumber, IsArray, IsNotEmptyObject } from "class-validator";
export class CreateBeerDto {
    
    @IsString({message: 'Должно быть строкой'})
    compound: string;

    @IsNumber({}, {message: 'Должно быть числом'})
    volume: number;

    @IsNumber({}, {message: 'Должно быть числом'})
    fortress: number;

    @IsNumber({}, {message: 'Должно быть числом'})
    ibu: number;

    @IsString({message: 'Должно быть строкой'})
    title: string;

    @IsString({message: 'Должно быть строкой'})
    description: string;

    @IsNumber({}, {message: 'Должно быть числом'})
    price: number;

    @IsNumber({}, {message: 'Должно быть числом'})
    quantity: number;
    
    @IsNumber({}, {message: 'Должно быть числом'})
    brandId: number;

    typePackagingId: number;

    @IsArray()
   // @IsNotEmptyObject()
    gradeIds: number[];

    forBottling:boolean;

    filtered: boolean;
}
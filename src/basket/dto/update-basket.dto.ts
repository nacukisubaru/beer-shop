import { IsNumber } from "class-validator";
export class IBasketProduct {
    readonly productId: number;
    readonly quantity: number;
}
export class UpdateBasketDto {
    @IsNumber({}, {message: 'Должно быть числом'})
    productId: number;
    @IsNumber({}, {message: 'Должно быть числом'})
    quantity: number;

    readonly hash: string;
}
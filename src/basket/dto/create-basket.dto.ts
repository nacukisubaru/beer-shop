import { IsNumber } from "class-validator";

export class CreateBasketDto {
    readonly hash;

  //  @IsNumber({}, {message: 'Должно быть числом'})
    //readonly userId: number;

    @IsNumber({}, {message: 'Должно быть числом'})
    readonly quantity: number;
    
    @IsNumber({}, {message: 'Должно быть числом'})
    productId: number;
}

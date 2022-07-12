import { IsBoolean, IsNumber } from "class-validator";

export class ActivateProductDto  {
    
    @IsNumber({}, {message:"Должно быть числом"})
    readonly id: number;

    @IsBoolean({message: 'Должно быть true или false'})
    readonly isActive: boolean;
}

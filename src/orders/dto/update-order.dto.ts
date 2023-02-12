import { IsNumber } from 'class-validator';

export class UpdateOrderDto {
    @IsNumber({}, {message: 'Должно быть числом'})
    id: number;

    @IsNumber({}, {message: 'Должно быть числом'})
    statusId: number;
}
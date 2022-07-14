export class CreateOrderDto {
    basketId: number;
    userId: number;
    deliveryId: number;
    paymentMethodId: number;
    isPayed: boolean;
}

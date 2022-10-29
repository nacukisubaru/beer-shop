export class IBasketProduct {
    readonly productId: number;
    readonly quantity: number;
}
export class UpdateBasketDto extends IBasketProduct {
    readonly hash: string;
}
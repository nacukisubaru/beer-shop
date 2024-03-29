export class CreateProductDto {
    title: string;
    description: string;
    price: number;
    quantity: number;
    brandId: number;
    typePackagingId: number;
    isActive: boolean;
    inStock: boolean;
}
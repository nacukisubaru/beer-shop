interface IProductFilter {
    id: number,
    title: string,
    description: string,
    brandIds: number[], 
    typesPackagingIds: number[], 
    minPrice: number, 
    maxPrice: number, 
    isActive: string,
}
import { Column, DataType, Model, Table, HasOne, BelongsToMany, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { ProductTypes } from 'src/product-types/product-type.model';
import { Products } from 'src/products/products.model';

@Table({ tableName: 'type-packaging' })
export class TypePackaging extends Model<TypePackaging> {
    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false })
    name: string;

    @BelongsTo(() => ProductTypes)
    productType: ProductTypes;
  
    @ForeignKey(() => ProductTypes)
    @Column({type: DataType.INTEGER})
    productTypeId: number;

    @HasMany(() => Products)
    products: Products[];
}
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { FishType } from 'src/fish-types/fish-types.model';
import { Products } from 'src/products/products.model';

@Table({tableName: 'fish'})
export class Fish extends Model<Fish> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ForeignKey(() => FishType)
  @Column({type: DataType.INTEGER, allowNull: false})
  fishTypeId: number;

  @Column({type: DataType.STRING, allowNull: false})
  fishTypeName: string;

  @Column({type: DataType.FLOAT})
  weight: number;

  @BelongsTo(() => FishType, { as: 'fishType'})
  fishType: FishType;

  @ForeignKey(() => Products)
  @Column({type: DataType.INTEGER})
  productId: number;
 
  @BelongsTo(() => Products, { as: 'product'})
  product: Products;
}
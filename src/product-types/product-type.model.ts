import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({tableName: 'product_types', createdAt: false, updatedAt: false})
export class ProductTypes extends Model<ProductTypes> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.STRING})
  name: string;

  @Column({type: DataType.STRING})
  code: string;
}
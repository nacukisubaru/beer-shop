import { BelongsToMany, Column, DataType, ForeignKey, Model, Table} from 'sequelize-typescript';
import { Products } from 'src/products/products.model';
import { Basket } from './basket.model';

@Table({tableName: 'basket_products'})
export class BasketProducts extends Model<BasketProducts> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ForeignKey(() => Products)
  @Column({type: DataType.INTEGER})
  productId: number;

  @ForeignKey(() => Basket)
  @Column({type: DataType.INTEGER})
  basketId: number;

  @Column({type: DataType.INTEGER})
  quantity: number;
}
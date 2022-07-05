import { Column, DataType, Model, Table, BelongsTo, ForeignKey} from 'sequelize-typescript';
import { Products } from 'src/products/products.model';

@Table({tableName: 'beers'})
export class Beers extends Model {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.STRING, allowNull: false})
  compound: string;

  @Column({type: DataType.INTEGER, allowNull: false})
  volume: number;

  @Column({type: DataType.FLOAT, allowNull: false})
  fortress: number;

  @Column({type: DataType.FLOAT, allowNull: false})
  ibu: number;

  @ForeignKey(() => Products)
  @Column({type: DataType.INTEGER})
  productId: number;

  @BelongsTo(() => Products)
  product: Products
}
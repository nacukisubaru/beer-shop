import { Column, DataType, Model, Table, BelongsTo, ForeignKey} from 'sequelize-typescript';
import { Products } from 'src/products/products.model';

@Table({tableName: 'snacks'})
export class Snack extends Model<Snack> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.FLOAT})
  weight: number;

  @ForeignKey(() => Products)
  @Column({type: DataType.INTEGER})
  productId: number;

  @BelongsTo(() => Products)
  product: Products;

  @Column({ type: DataType.INTEGER })
  price: number;
}
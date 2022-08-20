import { Column, DataType, Model, Table, BelongsTo, ForeignKey} from 'sequelize-typescript';
import { ProductTypes } from 'src/product-types/product-type.model';

@Table({tableName: 'brands'})
export class Brand extends Model<Brand> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.STRING, allowNull: false})
  name: string;

  @Column({type: DataType.STRING, allowNull: false})
  code: string;

  @BelongsTo(() => ProductTypes)
  productType: ProductTypes;

  @ForeignKey(() => ProductTypes)
  @Column({type: DataType.INTEGER})
  productTypeId: number;
}
import { Column, DataType, Model, Table, HasOne} from 'sequelize-typescript';
import { Beers } from 'src/beers/beers.model';

@Table({tableName: 'products'})
export class Products extends Model<Products> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.STRING, allowNull: false})
  title: string;

  @Column({type: DataType.STRING, allowNull: false})
  description: string;

  @Column({type: DataType.INTEGER})
  price: number;

  @Column({type: DataType.INTEGER})
  quantity: number;

  @Column({type: DataType.BOOLEAN, defaultValue: true})
  inStock: boolean;

  @Column({type: DataType.BOOLEAN, defaultValue: true})
  isActive: boolean

  @HasOne(()=>Beers)
  beer: Beers
  
}
import { Column, DataType, HasMany, Model, Table} from 'sequelize-typescript';
import { Basket } from 'src/basket/basket.model';

@Table({tableName: 'users'})
export class Users extends Model<Users> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.STRING, allowNull: false})
  name: string;

  @Column({type: DataType.STRING, allowNull: false})
  surname: string;

  @Column({type: DataType.STRING, allowNull: false})
  email: string;

  @Column({type: DataType.STRING, allowNull: false})
  phone: string;
  
  @Column({type: DataType.STRING, allowNull: false})
  password: string;

  @HasMany(() => Basket)
  baskets: Basket[]
}
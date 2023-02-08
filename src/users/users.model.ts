import { BelongsToMany, Column, DataType, HasMany, Model, Table} from 'sequelize-typescript';
import { Basket } from 'src/basket/basket.model';
import { Role } from 'src/roles/roles.model';
import { UserRoles } from 'src/roles/user-roles.model';

@Table({tableName: 'users'})
export class Users extends Model<Users> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.STRING, allowNull: true})
  fio: string;

  @Column({type: DataType.STRING, allowNull: false})
  email: string;

  @Column({type: DataType.STRING, allowNull: false})
  phone: string;
  
  @Column({type: DataType.STRING, allowNull: true})
  avatar: string;

  @Column({type: DataType.STRING, allowNull: false})
  password: string;

  @Column({type: DataType.BOOLEAN, allowNull: false})
  isActivated: boolean;

  @Column({type: DataType.STRING, allowNull: false})
  activationLink: string;

  @HasMany(() => Basket)
  baskets: Basket[];

  @BelongsToMany(() => Role, () => UserRoles)
  roles: Role[];
}
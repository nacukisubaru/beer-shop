import { Column, DataType, Model, Table, BelongsTo, BelongsToMany, ForeignKey} from 'sequelize-typescript';

@Table({tableName: 'brands'})
export class Brand extends Model<Brand> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.STRING, allowNull: false})
  name: string;

  @Column({type: DataType.STRING, allowNull: false})
  code: string;
}
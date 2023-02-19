import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({tableName: 'fish-type'})
export class FishType extends Model<FishType> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.STRING, allowNull: false})
  name: string;

}
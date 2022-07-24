import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({tableName: 'token'})
export class Token extends Model<Token> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  userId: number;

  @Column({type: DataType.STRING, allowNull: false})
  refreshToken: string;
}
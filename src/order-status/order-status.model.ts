import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({tableName: 'order-status',  createdAt: false, updatedAt: false })
export class OrderStatus extends Model<OrderStatus> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.STRING, allowNull: false})
  statusName: string;

  @Column({type: DataType.STRING, allowNull: false})
  status: string;

  @Column({type: DataType.STRING, allowNull: false})
  color: string;

}

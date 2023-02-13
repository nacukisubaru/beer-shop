import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table } from 'sequelize-typescript';
import { Basket } from 'src/basket/basket.model';
import { Users } from 'src/users/users.model';
import { OrderStatus } from '../order-status/order-status.model';

@Table({tableName: 'orders',  createdAt: false, updatedAt: false })
export class Order extends Model<Order> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ForeignKey(() => Users)
  userId: number;

  @ForeignKey(() => OrderStatus)
  statusId: number;

  @BelongsTo(() => Users, {as: 'customer'})
  customer: Users;

  @Column({ type: DataType.FLOAT, allowNull: false})
  amount: number;

  @BelongsTo(() => OrderStatus, {as: 'status'})
  status: OrderStatus;

  @HasOne(() => Basket, {as: 'basket'})
  basket: Basket

  products: [];
}

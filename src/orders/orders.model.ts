import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Table } from 'sequelize-typescript';
import { Basket } from 'src/basket/basket.model';
import { Delivery } from 'src/delivery/delivery.model';
import { PaymentMethod } from 'src/payment-methods/payment-methods.model';
import { Users } from 'src/users/users.model';

@Table({tableName: 'orders',  createdAt: false, updatedAt: false })
export class Order extends Model<Order> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @ForeignKey(() => Users)
  userId: number;

  @BelongsTo(() => Users, {as: 'customer'})
  customer: Users;

  @Column({ type: DataType.FLOAT, allowNull: false})
  amount: number;

  @Column({type: DataType.BOOLEAN})
  isPayed: boolean;

  @HasOne(() => Basket, {as: 'basket'})
  basket: Basket

  products: [];

  // @ForeignKey(() => Delivery)
  // deliveryId: number;

  // @BelongsTo(() => Delivery)
  // deliveryInfo: Delivery;

  // @ForeignKey(() => PaymentMethod)
  // paymentMethodId: number;

  // @BelongsTo(() => PaymentMethod)
  // paymentMethod: PaymentMethod
}

import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Order } from 'src/orders/orders.model';
import { Products } from 'src/products/products.model';
import { Users } from 'src/users/users.model';
import { BasketProducts } from './basket-products.model';

@Table({ tableName: 'basket' })
export class Basket extends Model<Basket> {

    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @ForeignKey(() => Users)
    @Column({ type: DataType.INTEGER })
    userId: number;

    @Column({type: DataType.STRING, allowNull: false})
    hash: string;

    @ForeignKey(() => Order)
    orderId: number;

    @BelongsTo(() => Users)
    customer: Users

    @BelongsToMany(() => Products, () => BasketProducts)
    products: Products[]
    length: boolean;
}
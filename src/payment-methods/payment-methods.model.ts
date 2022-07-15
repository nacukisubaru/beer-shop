import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'payment_methods', createdAt: false, updatedAt: false })
export class PaymentMethod extends Model<PaymentMethod> {

    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.STRING })
    name: string;

    @Column({ type: DataType.STRING })
    code: string;
}

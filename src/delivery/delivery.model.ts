import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'delivery', createdAt: false, updatedAt: false })
export class Delivery extends Model<Delivery> {

    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @Column({ type: DataType.ARRAY(DataType.STRING) })
    coords: string[];

    @Column({ type: DataType.STRING })
    address: string;

    @Column({ type: DataType.DATE })
    date: string;

    @Column({ type: DataType.TIME })
    time: string;

}

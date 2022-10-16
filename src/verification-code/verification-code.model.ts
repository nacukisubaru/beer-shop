import { Column, DataType, HasMany, Model, Table} from 'sequelize-typescript';

@Table({tableName: 'verification-codes'})
export class VerificationCodes extends Model<VerificationCodes> {
    @Column({ type: DataType.STRING, allowNull: false })
    phone: string;

    @Column({ type: DataType.STRING, allowNull: false })
    code: string;
}
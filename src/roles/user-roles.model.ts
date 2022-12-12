import {Column, DataType, ForeignKey, Model, Table} from "sequelize-typescript"
import { Users } from "src/users/users.model";
import { Role } from "./roles.model";

@Table({tableName: 'users_roles', createdAt: false, updatedAt: false})
export class UserRoles extends Model<UserRoles> {
    
    @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
    id: number;

    @ForeignKey(() => Role)
    @Column({type: DataType.INTEGER})
    roleId: number;

    @ForeignKey(() => Users)
    @Column({type: DataType.INTEGER})
    userId: number;
}
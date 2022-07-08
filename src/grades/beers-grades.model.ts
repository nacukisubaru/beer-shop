import { Column, DataType, Model, Table, ForeignKey } from 'sequelize-typescript';
import { Beers } from 'src/beers/beers.model';
import { Grades } from './grades.model';

@Table({ tableName: 'beer_grades', createdAt: false, updatedAt: false })
export class BeerGrades extends Model<BeerGrades> {

    @Column({ type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true })
    id: number;

    @ForeignKey(() => Grades)
    @Column({ type: DataType.INTEGER })
    gradeId: number;

    @ForeignKey(() => Beers)
    @Column({ type: DataType.INTEGER })
    beerId: number;
}
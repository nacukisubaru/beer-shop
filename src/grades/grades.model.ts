import { Column, DataType, Model, Table, HasOne, BelongsToMany } from 'sequelize-typescript';
import { Beers } from 'src/beers/beers.model';
import { BeerGrades } from './beers-grades.model';


@Table({tableName: 'grades',  createdAt: false, updatedAt: false })
export class Grades extends Model<Grades> {

  @Column({type: DataType.INTEGER, unique: true, autoIncrement: true, primaryKey: true})
  id: number;

  @Column({type: DataType.STRING, allowNull: false})
  name: string

  @BelongsToMany(() => Beers, () => BeerGrades)
  beers: Beers[]
}
import { Injectable } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grades } from './grades.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BeerGrades } from './beers-grades.model';

@Injectable()
export class GradesService {

    constructor(@InjectModel(Grades) private gradesRepo: typeof Grades,
        @InjectModel(BeerGrades) private beerGradesRepo: typeof BeerGrades) { }

    async create(createGradeDto: CreateGradeDto) {
        return await this.gradesRepo.create(createGradeDto);
    }

    async findById(id: number) {
        return await this.gradesRepo.findByPk(id);
    }

    async findByIds(ids: number[]) {
        return await this.gradesRepo.findAll({ include: { all: true }, where: { id: { [Op.or]: ids } } });
    }

    async findAll() {
        return await this.gradesRepo.findAll();
    }

    async update(id: number, updateGradeDto: UpdateGradeDto) {
        return await this.gradesRepo.update({ ...updateGradeDto }, { where: { id } });
    }

    async remove(id) {
        return await this.gradesRepo.destroy({ where: { id } });
    }

    async getBeersIdsByGrades(gradeIds: []) {
        const beerIds = await this.beerGradesRepo.findAll({ include: { all: true }, where: { gradeId: { [Op.or]: gradeIds } } });
        return beerIds.map(item => {
           return item.getDataValue('beerId');
        });
    }
}

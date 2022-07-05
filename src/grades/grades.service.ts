import { Injectable } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grades } from './grades.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class GradesService {

    constructor(@InjectModel(Grades) private gradesRepo: typeof Grades) { }

    create(createGradeDto: CreateGradeDto) {
        return 'This action adds a new grade';
    }

    findAll() {
        return this.gradesRepo.findAll();
    }

    findOne(id: number) {
        return `This action returns a #${id} grade`;
    }

    update(id: number, updateGradeDto: UpdateGradeDto) {
        return `This action updates a #${id} grade`;
    }

    remove(id: number) {
        return `This action removes a #${id} grade`;
    }
}

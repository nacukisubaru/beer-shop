import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { Grades } from './grades.model';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { BeerGrades } from './beers-grades.model';
import { defaultLimitPage, paginate } from 'src/helpers/paginationHelper';
import { isNumber } from 'src/helpers/typesHelper';
import { BeersService } from 'src/beers/beers.service';

interface IFilter {
    id: number,
    name: string,
}

@Injectable()
export class GradesService {

    constructor(
        @InjectModel(Grades) private gradesRepo: typeof Grades,
        @InjectModel(BeerGrades) private beerGradesRepo: typeof BeerGrades,
       // private beerService: BeersService        
    ) { }

    async create(createGradeDto: CreateGradeDto) {
        return await this.gradesRepo.create(createGradeDto);
    }

    async findById(id: number) {
        return await this.gradesRepo.findByPk(id);
    }

    async findByIds(ids: number[]) {
        return await this.gradesRepo.findAll({ include: { all: true }, where: { id: { [Op.or]: ids } } });
    }

    async findAll(page: number, limitPage: number = defaultLimitPage, filter: IFilter, sort?: ISort) {
        if (!isNumber(page)) {
            throw new HttpException('Параметр page не был передан', HttpStatus.BAD_REQUEST);
        }

        if (!isNumber(limitPage)) {
            throw new HttpException('Параметр limitPage не был передан', HttpStatus.BAD_REQUEST);
        }

        const prepareFilter: any = {include: {all: true}, where: {}};

        if(filter.name) {
            prepareFilter.where.name = { [Op.iLike]: `%${filter.name}%` };
        }

        if(filter.id) {
            prepareFilter.where.id = filter.id;
        }

        const query: any = paginate(prepareFilter, page, limitPage);
        if (sort && sort.sortField && sort.order) {
            const sortArray = [
                sort.sortField,
                sort.order
            ];
            query.order = [sortArray];
        }
        console.log({ query })
        const data = await this.gradesRepo.findAndCountAll(query);
        if (!data.rows || data.rows.length <= 0) {
            throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
        }

        const lastPage = Math.ceil(data.count / limitPage) - 1;
        let nextPage = 0;
        if (lastPage > 0) {
            nextPage = page + 1;
        }

        return { ...data, nextPage, lastPage };
    }

    async update(id: number, updateGradeDto: UpdateGradeDto) {
        return await this.gradesRepo.update({ ...updateGradeDto }, { where: { id } });
    }

    async remove(id) {
        const beersIds = await this.getBeersIdsByGrades([id]);
        //const beers = this.beerService.getByids(beersIds);
        //console.log({beers});
        if(beersIds.length) {
            throw new HttpException(`У данного сорта есть привязки к пиву id ${beersIds.toString()} нужно удалить`, HttpStatus.BAD_REQUEST)
        }
        return await this.gradesRepo.destroy({ where: { id } });
    }

    async getBeersIdsByGrades(gradeIds: number[]) {
        const beerIds = await this.beerGradesRepo.findAll({ include: { all: true }, where: { gradeId: { [Op.or]: gradeIds } } });
        return beerIds.map(item => {
            return item.getDataValue('beerId');
        });
    }
}

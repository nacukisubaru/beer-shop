import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Fish } from 'src/fish/fish.model';
import { FishService } from 'src/fish/fish.service';
import { defaultLimitPage, paginate } from 'src/helpers/paginationHelper';
import { isModelTableFields } from 'src/helpers/sequlizeHelper';
import { isNumber } from 'src/helpers/typesHelper';
import { CreateFishTypeDto } from './dto/create-fish-type.dto';
import { UpdateFishTypeDto } from './dto/update-fish-type.dto';
import { FishType } from './fish-types.model';

interface IFilter {
    id: number,
    name: string
}

@Injectable()
export class FishTypesService {
    constructor(
        @InjectModel(FishType) private fishTypeRepo: typeof FishType
    ) {}

    async create(createFishTypeDto: CreateFishTypeDto) {
        return await this.fishTypeRepo.create(createFishTypeDto);
    }

    async update(updateFishTypeDto: UpdateFishTypeDto) {
        const id = updateFishTypeDto.id;
        if (!id) {
            throw new HttpException('ID не передан', HttpStatus.BAD_REQUEST);
        }

        const fishType = await this.getById(id);
        if (!fishType) {
            throw new HttpException('Тип рыбы не найден', HttpStatus.NOT_FOUND);
        }

        fishType.name = updateFishTypeDto.name;
        fishType.save();
    }

    async remove(id: number) {
        if (!id) {
            throw new HttpException('ID не передан', HttpStatus.BAD_REQUEST);
        }
        const fishType = await this.getById(id);
        if (!fishType) {
            throw new HttpException('Тип рыбы не найден', HttpStatus.NOT_FOUND);
        }
       
        const fishs = await Fish.findAll({where: {
            fishTypeId: id
        }});

        if(fishs.length) {
            throw new HttpException(`У данного типа рыбы есть привязки к товарам(рыба) с этими идентификаторами(id) 
            ${fishs.map((fish) => fish.productId).toString()} нужно отвязать после можно удалить тип рыбы`, HttpStatus.BAD_REQUEST)
        }

        return await this.fishTypeRepo.destroy({where:{id}});
    }

    async getById(id: number) {
       return await this.fishTypeRepo.findOne({where: {id}});
    }

    async getListPagination(page: number, limitPage: number = defaultLimitPage, filter: IFilter, sort?: ISort) {
        if (!isNumber(page)) {
            throw new HttpException('Параметр page не был передан', HttpStatus.BAD_REQUEST);
        }
        
        if (!isNumber(limitPage)) {
            throw new HttpException('Параметр limitPage не был передан', HttpStatus.BAD_REQUEST);
        }
      
        const prepareFilter: any = {include:{all:true}, where: {}};

        if(filter.name) {
            prepareFilter.where.name = { [Op.iLike]: `%${filter.name}%` };
        }

        if(filter.id) {
            prepareFilter.where.id = filter.id;
        }

        const count = await FishType.count();
        const query: any = paginate(prepareFilter, page, limitPage);
        if (sort && sort.sortField && sort.order) {
            const sortArray = [
                sort.sortField,
                sort.order
            ];
            if (isModelTableFields(sort.sortField, FishType)) {
                query.order = [sortArray];
            }
        }
    
        const data = await this.fishTypeRepo.findAndCountAll(query);
        if (!data.rows || data.rows.length <= 0) {
            throw new HttpException('Page not found', HttpStatus.NOT_FOUND);
        }
        data.count = count;
        const lastPage = Math.ceil(data.count / limitPage) - 1;
        let nextPage = 0;
        if (lastPage > 0) {
            nextPage = page + 1;
        }

        return { ...data, nextPage, lastPage };
    }

    getList() {
       return this.fishTypeRepo.findAll();
    }
}

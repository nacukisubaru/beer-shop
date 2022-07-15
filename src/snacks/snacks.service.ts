import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { paginate } from 'src/helpers/paginationHelper';
import { CreateSnackDto } from './dto/create-snack.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';
import { Snack } from './snacks.model';

@Injectable()
export class SnacksService {
    constructor(@InjectModel(Snack) private snackRepo: typeof Snack) {}

    async create(createSnackDto: CreateSnackDto) {
        return 'This action adds a new snack';
    }

    async getList(page: number) {
        if(page) {
            const query = paginate({include: { all: true }}, page);
            const snackList = await this.snackRepo.findAndCountAll(query);
        
            snackList.rows = snackList.rows.filter((snack) => {
                if(snack.product.getDataValue('isActive')) {
                    return snack;
                }
            });

            return snackList;
        }
        
        throw new HttpException('Параметр page не был передан', HttpStatus.BAD_REQUEST);
    }

    async findOne(id: number) {
        return `This action returns a #${id} snack`;
    }

    async update(id: number, updateSnackDto: UpdateSnackDto) {
        return `This action updates a #${id} snack`;
    }

    async remove(id: number) {
        return `This action removes a #${id} snack`;
    }
}

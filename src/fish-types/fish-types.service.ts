import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateFishTypeDto } from './dto/create-fish-type.dto';
import { UpdateFishTypeDto } from './dto/update-fish-type.dto';
import { FishType } from './fish-types.model';

@Injectable()
export class FishTypesService {
    constructor(@InjectModel(FishType) private fishTypeRepo: typeof FishType) {}

    create(createFishTypeDto: CreateFishTypeDto) {
        return 'This action adds a new fishType';
    }

    update(id: number, updateFishTypeDto: UpdateFishTypeDto) {
        return `This action updates a #${id} fishType`;
    }

    remove(id: number) {
        return `This action removes a #${id} fishType`;
    }

    getList() {
       return this.fishTypeRepo.findAll();
    }
}

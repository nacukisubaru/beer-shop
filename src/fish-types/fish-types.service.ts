import { Injectable } from '@nestjs/common';
import { CreateFishTypeDto } from './dto/create-fish-type.dto';
import { UpdateFishTypeDto } from './dto/update-fish-type.dto';

@Injectable()
export class FishTypesService {
    create(createFishTypeDto: CreateFishTypeDto) {
        return 'This action adds a new fishType';
    }

    findAll() {
        return `This action returns all fishTypes`;
    }

    findOne(id: number) {
        return `This action returns a #${id} fishType`;
    }

    update(id: number, updateFishTypeDto: UpdateFishTypeDto) {
        return `This action updates a #${id} fishType`;
    }

    remove(id: number) {
        return `This action removes a #${id} fishType`;
    }
}

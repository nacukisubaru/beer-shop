import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Brand } from './brands.model';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {

    constructor(@InjectModel(Brand) private brandRepo: typeof Brand) { }

    async getById(id: number) {
       return await this.brandRepo.findOne({include:{all: true}, where: {id}});
    }

    async create(createBrandDto: CreateBrandDto) {
        return await this.brandRepo.create(createBrandDto);
    }

    findAll() {
        return `This action returns all brands`;
    }

    findOne(id: number) {
        return `This action returns a #${id} brand`;
    }

    update(id: number, updateBrandDto: UpdateBrandDto) {
        return `This action updates a #${id} brand`;
    }

    remove(id: number) {
        return `This action removes a #${id} brand`;
    }
}

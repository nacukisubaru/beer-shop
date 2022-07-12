import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Basket } from './basket.model';
import { CreateBasketDto } from './dto/create-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';

@Injectable()
export class BasketService {

  constructor(@InjectModel(Basket) private basketRepo: typeof Basket) {}

  create(createBasketDto: CreateBasketDto) {
    return 'This action adds a new basket';
  }

  async getList() {
    return await this.basketRepo.findAll({include: {all:true}});
    //return `This action returns all basket`;
  }

  findOne(id: number) {
    return `This action returns a #${id} basket`;
  }

  update(id: number, updateBasketDto: UpdateBasketDto) {
    return `This action updates a #${id} basket`;
  }

  remove(id: number) {
    return `This action removes a #${id} basket`;
  }
}

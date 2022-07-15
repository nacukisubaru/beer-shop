import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { isNumber } from 'src/helpers/typesHelper';
import { paginate } from 'src/helpers/paginationHelper';
import { ProductsService } from 'src/products/products.service';
import { CreateSnackDto } from './dto/create-snack.dto';
import { UpdateSnackDto } from './dto/update-snack.dto';
import { Snack } from './snacks.model';

@Injectable()
export class SnacksService {
    constructor(@InjectModel(Snack) private snackRepo: typeof Snack,
                private productService: ProductsService) {}


    async create(createSnackDto: CreateSnackDto) {
        const productData = {
            title: createSnackDto.title,
            description: createSnackDto.description,
            price: createSnackDto.price,
            quantity: createSnackDto.quantity
        };

        const product = await this.productService.create(productData);
        const snack = await this.snackRepo.create({weight: createSnackDto.weight});

        snack.productId = product.id;
        snack.save();
        return snack;
    }

    async getList(page: number) {
        if(isNumber(page)) {
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

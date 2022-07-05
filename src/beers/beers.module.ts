import { Module } from '@nestjs/common';
import { BeersController } from './beers.controller';
import { BeersService } from './beers.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Beers } from './beers.model';
import { Products } from 'src/products/products.model';
import { Grades } from 'src/grades/grades.model';
import { BeerGrades } from 'src/grades/beers-grades.model';

@Module({
    controllers: [BeersController],
    providers: [BeersService],
    imports: [
        SequelizeModule.forFeature([Beers, Products, Grades, BeerGrades])
    ],
    exports: [BeersModule]
})
export class BeersModule { }

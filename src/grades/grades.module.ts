import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Beers } from 'src/beers/beers.model';
import { Grades } from './grades.model';
import { BeerGrades } from './beers-grades.model';
import { ProductsModule } from 'src/products/products.module';
import { TokenModule } from 'src/token/token.module';

@Module({
    controllers: [GradesController],
    providers: [GradesService],
    imports: [
        SequelizeModule.forFeature([Beers, Grades, BeerGrades]),
        ProductsModule,
        TokenModule
    ],
    exports: [GradesService]
})
export class GradesModule { }

import { Module } from '@nestjs/common';
import { SnacksService } from './snacks.service';
import { SnacksController } from './snacks.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Snack } from './snacks.model';

@Module({
    controllers: [SnacksController],
    providers: [SnacksService],
    imports: [
        SequelizeModule.forFeature([Snack])
    ]
})
export class SnacksModule { }

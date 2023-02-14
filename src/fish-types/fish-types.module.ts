import { Module } from '@nestjs/common';
import { FishTypesService } from './fish-types.service';
import { FishTypesController } from './fish-types.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Fish } from 'src/fish/fish.model';
import { FishType } from './fish-types.model';

@Module({
    controllers: [FishTypesController],
    providers: [FishTypesService],
    imports: [
        SequelizeModule.forFeature([Fish, FishType])
    ],
    exports: [
        FishTypesService
    ]
})
export class FishTypesModule {}
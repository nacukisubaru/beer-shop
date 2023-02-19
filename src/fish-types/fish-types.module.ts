import { forwardRef, Module } from '@nestjs/common';
import { FishTypesService } from './fish-types.service';
import { FishTypesController } from './fish-types.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Fish } from 'src/fish/fish.model';
import { FishType } from './fish-types.model';
import { TokenModule } from 'src/token/token.module';
import { RolesModule } from 'src/roles/roles.module';
import { FishModule } from 'src/fish/fish.module';
import { FishService } from 'src/fish/fish.service';

@Module({
    controllers: [FishTypesController],
    providers: [FishTypesService],
    imports: [
        SequelizeModule.forFeature([FishType]),
        TokenModule,
        RolesModule,
    ],
    exports: [
        FishTypesService
    ]
})
export class FishTypesModule {}
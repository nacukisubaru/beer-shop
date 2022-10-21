import { Module } from '@nestjs/common';
import { VerificationCodeService } from './verification-code.service';
import { VerificationCodeController } from './verification-code.controller';
import { HttpModule } from '@nestjs/axios';
import { SequelizeModule } from '@nestjs/sequelize';
import { VerificationCodes } from './verification-code.model';
import { TaskManagerModule } from 'src/tasks-manager/tasks-manager.module';

@Module({
  imports: [
    SequelizeModule.forFeature([VerificationCodes]),
    HttpModule,
    TaskManagerModule
  ],
  controllers: [VerificationCodeController],
  providers: [VerificationCodeService],
  exports:[VerificationCodeService]
})
export class VerificationCodeModule {}

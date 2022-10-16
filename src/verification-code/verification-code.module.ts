import { Module } from '@nestjs/common';
import { VerificationCodeService } from './verification-code.service';
import { VerificationCodeController } from './verification-code.controller';
import { HttpModule } from '@nestjs/axios';
import { SequelizeModule } from '@nestjs/sequelize';
import { VerificationCodes } from './verification-code.model';

@Module({
  imports: [
    SequelizeModule.forFeature([VerificationCodes]),
    HttpModule
  ],
  controllers: [VerificationCodeController],
  providers: [VerificationCodeService]
})
export class VerificationCodeModule {}

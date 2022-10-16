import { Controller, Get, Query, Ip } from '@nestjs/common';

import { VerificationCodeService } from './verification-code.service';

@Controller('verification-code')
export class VerificationCodeController {
    constructor(private readonly verificationCodeService: VerificationCodeService) { }

    @Get('/sendCodeByCall')
    sendCodeByCall(@Query('phone') phone: string, @Ip() ip: string) {
        return this.verificationCodeService.sendCodeByCall(phone, ip);
    }

    @Get('/getTimestampSentCode')
    getTimestampSentCode(@Query('phone') phone: string) {
        return this.verificationCodeService.getTimestampSentCode(phone);
    }
}
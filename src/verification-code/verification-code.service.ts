import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios/dist/http.service';
import { map, tap } from 'rxjs';
import { InjectModel } from '@nestjs/sequelize';
import { VerificationCodes } from './verification-code.model';

@Injectable()
export class VerificationCodeService {
    apiId: string;
    constructor(
        @InjectModel(VerificationCodes) private verificationCodes: typeof VerificationCodes,
        private readonly httpService: HttpService,
    ) {
        this.apiId = process.env.SMSRU_API_ID;
    }

    sendCodeByCall(phone: string, ip: string) {
        if(phone && typeof phone === "string") {
            const response = this.httpService.get(
                `${'https://sms.ru/code/call?phone=' + phone + '&ip='+ip+'&api_id=' + this.apiId}`, 
                {
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            ).pipe(
                tap((response) => {
                    this.verificationCodes.create({phone, code:response.data.code})
                    delete response.data.code;
                }),
                map(response => response.data),
            );

            return response;
        }
    }

    removeCode(phone:string) {
        this.verificationCodes.destroy({where:{phone}});
    }
}

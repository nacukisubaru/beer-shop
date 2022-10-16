import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios/dist/http.service';
import { map, tap } from 'rxjs';
import { InjectModel } from '@nestjs/sequelize';
import { VerificationCodes } from './verification-code.model';
import { TaskManagerService } from 'src/tasks-manager/tasks-manager.service';
import { throws } from 'assert';
import { Cron, Timeout } from '@nestjs/schedule';

@Injectable()
export class VerificationCodeService {
    apiId: string;
    constructor(
        @InjectModel(VerificationCodes) private verificationCodes: typeof VerificationCodes,
        private readonly httpService: HttpService,
        private taskManagerService: TaskManagerService
    ) {
        this.apiId = process.env.SMSRU_API_ID;
    }

    async sendCodeByCall(phone: string, ip: string) {
        if(phone && typeof phone === "string") {
            const isCanSendCode = await this.isCanSendCode(phone);
            if(!isCanSendCode) {
                throw new HttpException('Пока вы не можете отправить запрос!', HttpStatus.NOT_ACCEPTABLE);
            }
            const response = this.httpService.get(
                `${'https://sms.ru/code/call?phone=' + phone + '&ip='+ip+'&api_id=' + this.apiId}`, 
                {
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            ).pipe(
                tap((response) => {
                    if(response.data && response.data.code) {
                        this.addCodeAndCreateTaskForRemove(phone, response.data.code);
                        delete response.data.code;
                    }
                }),
                map(response => response.data),
            );

            return response;
        }
    }

    async addCodeAndCreateTaskForRemove(phone: string, code: string) {
        const context = this;
        function removeCode() {
            context.verificationCodes.destroy({where:{phone}});
        }

        await this.verificationCodes.create({phone, code});
        this.taskManagerService.createTask(removeCode, 'remove code for '+phone, '0 */5 * * * *', true);  
    }

    async isCanSendCode(phone: string) {
        const result = await this.verificationCodes.findOne({where:{phone}});
        if(result) {
            return false;
        }

        return true;
    }

    async getTimestampSentCode(phone: string) {
       const result = await this.verificationCodes.findOne({where:{phone}});
       if(result) {
            return result.createdAt;
       }
       
       return false;
    }

    @Timeout(1000)
    async removeAllCodes() {
        await this.verificationCodes.destroy({where:{}, truncate: true});
    }
}

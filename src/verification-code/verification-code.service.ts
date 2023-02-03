import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios/dist/http.service';
import { map, tap } from 'rxjs';
import { InjectModel } from '@nestjs/sequelize';
import { VerificationCodes } from './verification-code.model';
import { TaskManagerService } from 'src/tasks-manager/tasks-manager.service';
import { Timeout } from '@nestjs/schedule';
import * as moment from "moment";

@Injectable()
export class VerificationCodeService {
    apiId: string;
    timeRemoveCode: number;

    constructor(
        @InjectModel(VerificationCodes) private verificationCodes: typeof VerificationCodes,
        private readonly httpService: HttpService,
        private taskManagerService: TaskManagerService
    ) {
        this.apiId = process.env.SMSRU_API_ID;
        this.timeRemoveCode = 2;
    }

    async sendCodeByCall(phone: string, ip: string) {
        if(!phone) {
            throw new HttpException('Не передан параметр phone', HttpStatus.BAD_REQUEST);
        }
        if(!ip) {
            throw new HttpException('Не передан параметр ip', HttpStatus.BAD_REQUEST);
        }

        if (phone && typeof phone === "string") {
            const isCanSendCode = await this.isCanSendCode(phone);
            if (!isCanSendCode) {
                const {minutes, seconds} = await this.getRemainingTime(phone);
                return {
                    status: 'ERROR_LIMIT_TIME', 
                    statusText: 'Пока вы не можете запросить код время до следующего запроса ' + minutes + ':' + seconds,
                    remainingTime: {minutes, seconds}
                };
            }
            const response = this.httpService.get(
                `${'https://sms.ru/code/call?phone=' + phone + '&ip=' + ip + '&api_id=' + this.apiId}`,
                {
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            ).pipe(
                tap((response) => {
                    if (response.data && response.data.code) {
                        this.addCodeAndCreateTaskForRemove(phone, response.data.code);
                        delete response.data.code;
                    }
                }),
                map(response => response.data),
            );

            return response;
        }
    }

    addCodeAndCreateTaskForRemove(phone: string, code: string) {
        const context = this;
        function removeCode() {
            context.verificationCodes.destroy({ where: { phone } });
        }

        setTimeout(()=>{
            removeCode();
        }, 120000);

        this.verificationCodes.create({ phone, code });
    }

    async isCanSendCode(phone: string) {
        if(!phone) {
            throw new HttpException('Не передан параметр phone', HttpStatus.BAD_REQUEST);
        }
        const result = await this.verificationCodes.findOne({ where: { phone } });
        if (result) {
            return false;
        }

        return true;
    }

    async getRecordByPhone(phone: string) {
        if(!phone) {
            throw new HttpException('Не передан параметр phone', HttpStatus.BAD_REQUEST);
        }
        return await this.verificationCodes.findOne({ where: { phone } });
    }

    async getTimestampSentCode(phone: string) {
        if(!phone) {
            throw new HttpException('Не передан параметр phone', HttpStatus.BAD_REQUEST);
        }
        const result = await this.getRecordByPhone(phone);
        if (result) {
            return result.createdAt;
        }

        throw new HttpException(`${'По номеру телефона +' + phone + ' метка времени не найдена!'}`, HttpStatus.NOT_FOUND);
    }

    async getRemainingTime(phone: string) {
        if(!phone) {
            throw new HttpException('Не передан параметр phone', HttpStatus.BAD_REQUEST);
        }
        const timestamp = await this.getTimestampSentCode(phone);
        if (timestamp) {
            const timestampNow = moment();
            const timestampFuture = moment(timestamp).add(this.timeRemoveCode, 'minutes');
            const seconds = parseInt(moment.utc(moment(timestampFuture, "DD/MM/YYYY HH:mm:ss").diff(moment(timestampNow, "DD/MM/YYYY HH:mm:ss"))).format("ss"));
            let minutes = moment(timestampFuture).diff(timestampNow, 'minutes');
            if (minutes === this.timeRemoveCode) {
                minutes = minutes - 1;
            }

            return {minutes, seconds};
        }
    }

    async verifyCode(phone: string, code: string) {
        if(!phone) {
            throw new HttpException('Номер телефона не заполнен', HttpStatus.BAD_REQUEST);
        }
        if(!code) {
            throw new HttpException('Код не заполнен', HttpStatus.BAD_REQUEST);
        }
        const record = await this.getRecordByPhone(phone);
        if (record && record.code === code) {
            return true;
        }

        return false;
    }

    async removeVerifyCode(phone: string) {
        this.verificationCodes.destroy({where:{phone}});
    }

    @Timeout(1000)
    async removeAllCodes() {
        await this.verificationCodes.destroy({ where: {}, truncate: true });
    }
}

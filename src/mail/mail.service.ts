import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    transporter: any;
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация email на сайте ' + process.env.API_URL,
            text: '',
            html: ` <div>
                        <h1>Для активации email перейдите по ссылке<h1>
                        <a href="${link}">${link}</a>
                    </div>`
        });
    }

    async sendOrderReadyMail(to: string, orderNumber: number) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Ваш заказ готов ' + process.env.API_URL,
            text: '',
            html: `<div>
                        <h1>Ваш заказ №${orderNumber} готов можно забрать<h1>
                        По адресу ул. Братьев Луканиных, 7, Калуга Пивградъ
                    </div>`
        });
    }

    async sendOrderInWorkMail(to: string, orderNumber: number) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Мы подготавливаем ваш заказ ' + process.env.API_URL,
            text: '',
            html: `<div>
                        <h1>Ваш заказ №${orderNumber} взят в работу<h1>
                        Мы начали сборку вашего заказа ожидайте. Вам придет оповещение на почту когда все будет готово или вам позвонят.
                    </div>`
        });
    }
}
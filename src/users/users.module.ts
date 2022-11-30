import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Users } from './users.model';
import { TokenModule } from 'src/token/token.module';
import { MailModule } from 'src/mail/mail.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { RolesModule } from 'src/roles/roles.module';

@Module({
    controllers: [UsersController],
    providers: [UsersService],
    imports: [
        SequelizeModule.forFeature([Users]),
        TokenModule,
        MailModule,
        VerificationCodeModule,
        RolesModule
    ],
    exports: [UsersService, UsersModule]
})
export class UsersModule { }

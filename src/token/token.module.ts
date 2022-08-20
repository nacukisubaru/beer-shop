import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Token } from './token.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
    controllers: [TokenController],
    providers: [TokenService],
    imports: [
        SequelizeModule.forFeature([Token]),
        JwtModule.register({})
    ],
    exports: [TokenService, JwtModule, TokenModule]
})
export class TokenModule { }

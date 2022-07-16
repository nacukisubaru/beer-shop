import { Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Token } from './token.model';
import { GenerateTokenDto } from './dto/generate-token.dto';

@Injectable()
export class TokenService {

    constructor(@InjectModel(Token) private tokenRepo: typeof Token,
                private jwtService: JwtService) {}

    async generateTokens(generateTokenDto: GenerateTokenDto) {
        const accessToken = await this.jwtService.signAsync(
            generateTokenDto, 
            {
                secret: process.env.JWT_ACCESS_SECRET, 
                expiresIn: '30m'
            }
        );

        const refreshToken = await this.jwtService.signAsync(
            generateTokenDto,
            {
                secret: process.env.JWT_REFRESH_SECRET, 
                expiresIn: '30d'
            }
        );

        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(createTokenDto: CreateTokenDto) {
        const tokenData = await this.tokenRepo.findOne({where:{userId: createTokenDto.userId}});
        if(tokenData) {
            tokenData.refreshToken = createTokenDto.refreshToken;
            return tokenData.save();
        }
        
       return await this.tokenRepo.create({...createTokenDto});
    }

    async removeToken(refreshToken: string) {
        return await this.tokenRepo.destroy({where:{refreshToken}});
    }

    async validateRefreshToken(token: string): Promise<JwtService> {
        try {
            const userData = await this.jwtService.verifyAsync(token, {secret: process.env.JWT_REFRESH_SECRET});
            return userData;
        } catch (e) {
            return null;
        }
    }

    async findRefreshToken(refreshToken: string) {
       return await this.tokenRepo.findOne({where: {refreshToken}});
    }
}

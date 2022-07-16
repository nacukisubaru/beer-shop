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

    create(createTokenDto: CreateTokenDto) {
        return 'This action adds a new token';
    }

    findAll() {
        return `This action returns all token`;
    }

    findOne(id: number) {
        return `This action returns a #${id} token`;
    }

    update(id: number, updateTokenDto: UpdateTokenDto) {
        return `This action updates a #${id} token`;
    }

    remove(id: number) {
        return `This action removes a #${id} token`;
    }
}

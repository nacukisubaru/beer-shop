import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users } from './users.model';
import * as bcrypt from 'bcryptjs';
import { TokenService } from 'src/token/token.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {

    constructor(@InjectModel(Users) private userRepo: typeof Users,
                private tokenService: TokenService,
                private mailService: MailService) { }

    async registrate(createUserDto: CreateUserDto) {
        const userExist = await this.getUserByEmail(createUserDto.email)
        if (userExist) {
            throw new HttpException(`Пользователь c email ${userExist.email} уже существует !`, HttpStatus.BAD_REQUEST);
        }
        
        const hashPassword = await bcrypt.hash(createUserDto.password, 5);
        const user = await this.userRepo.create(
            { 
                ...createUserDto, password: hashPassword,
                activationLink: hashPassword,
                isActivated: false
            }
        );
        
        this.mailService.sendActivationMail(user.email, `${process.env.API_URL}/users/activate/${user.activationLink}`);
        return await this.createTokensAndSave(user);
    }

    async login(authUserDto: AuthUserDto) {
        const user = await this.validateUser(authUserDto);
        return await this.createTokensAndSave(user);
    }

    async logout(refreshToken: string) {
        return await this.tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken: string) {
        if(!refreshToken) {
            throw new UnauthorizedException();
        }
        const token = await this.tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await this.tokenService.findRefreshToken(refreshToken);
        if(!token || !tokenFromDb) {
            throw new UnauthorizedException();
        }

        const user = await this.getById(tokenFromDb.userId);
        return await this.createTokensAndSave(user);
    }

    async activate(activationLink) {
        const user = await this.userRepo.findOne({where: {activationLink}});
        if(!user) {
            throw new HttpException("Некорректная ссылка активации", HttpStatus.NOT_FOUND);
        }

        user.isActivated = true;
        user.save();
        return true;
    }

    private async createTokensAndSave(user: Users) {
        const payload = {id: user.id, email: user.email};
        const tokens = await this.tokenService.generateTokens(payload);
        await this.tokenService.saveToken({userId: user.id, refreshToken: tokens.refreshToken});
        return {
            ...tokens,
            user
        };
    }

    private async validateUser(authUserDto: AuthUserDto) {
        const user = await this.getUserByEmail(authUserDto.email);
        if(user) {
            const passwordEquals = await bcrypt.compare(authUserDto.password, user.password);
            if(passwordEquals) {
                return user;
            }
        }

        throw new UnauthorizedException({message: 'Некорректный email или пароль'})
    }

    async getUserByEmail(email: string) {
        return await this.userRepo.findOne({ where: { email }, include: { all: true } });
    }

    async getById(id: number) {
       return await this.userRepo.findOne({where: {id}});
    }

    create(createUserDto: CreateUserDto) {
        return 'This action adds a new user';
    }

    findAll() {
        return `This action returns all users`;
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }
}

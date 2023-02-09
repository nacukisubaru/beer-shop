import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Users } from './users.model';
import * as bcrypt from 'bcryptjs';
import { TokenService } from 'src/token/token.service';
import { MailService } from 'src/mail/mail.service';
import { VerificationCodeService } from 'src/verification-code/verification-code.service';
import { AuthUserByCodeDto } from './dto/auth-user-by-code.dto';
import { RolesService } from 'src/roles/roles.service';
import { FilesService } from 'src/files/filtes.service';

@Injectable()
export class UsersService {

    constructor(@InjectModel(Users) private userRepo: typeof Users,
                private tokenService: TokenService,
                private mailService: MailService,
                private verificationService: VerificationCodeService,
                private roleService: RolesService,
                private fileService: FilesService,
                ) { }

    async registrate(createUserDto: CreateUserDto) {
        this.checkUserNotExistByEmailAndPhone(createUserDto.phone, createUserDto.email);

        const hashPassword = await bcrypt.hash(createUserDto.password, 5);
        const user = await this.userRepo.create(
            { 
                ...createUserDto, 
                password: hashPassword,
                activationLink: hashPassword,
                isActivated: false,
                fio: '',
            }
        );
    
        if(user) {
            await this.roleService.bindRole({userId: user.id, role: 'USER'});
            this.createTokensAndSave(user);
            this.mailService.sendActivationMail(user.email, `${process.env.API_URL}/users/activate/${user.activationLink}`);
            return true;
        }

        return false;
    }

    async verifyUserByCode(phone: string, code: string) {
        const user = await this.getUserByPhone(phone);
        if(!user) {
            throw new HttpException(`${'Пользователя с номером ' + phone + ' не существует'}`, HttpStatus.NOT_FOUND);
        }

        const isVerify = await this.verificationService.verifyCode(phone, code);
        if (!isVerify) {
            throw new UnauthorizedException({message: 'Неверный код!'});
        }

        if(!user.isActivated) {
            user.isActivated = true;
            user.save();
        }

        return user;
    }

    async verifyPhoneByCode(phone: string, code: string) {
        const isVerify = await this.verificationService.verifyCode(phone, code);
        if (!isVerify) {
            throw new UnauthorizedException({message: 'Неверный код!'});
        }
        return true;
    }

    async login(authUserDto: AuthUserDto) {
        const user = await this.validateUser(authUserDto);
        return await this.createTokensAndSave(user);
    }

    async loginByCode(authUserByCodeDto: AuthUserByCodeDto) {
       const user = await this.verifyUserByCode(authUserByCodeDto.phone, authUserByCodeDto.code);
       return await this.createTokensAndSave(user);
    }

    async logout(refreshToken: string) {
        return await this.tokenService.removeToken(refreshToken);
    }

    async refresh(refreshToken: string) {
        if(!refreshToken || refreshToken == undefined) {
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
        const roles = await this.roleService.getRolesByUserId(user.id);
        if(roles.length) {
            const payload = {id: user.id, email: user.email, phone: user.phone, roles: roles.map((role) => role.getDataValue("value"))};
            const tokens = await this.tokenService.generateTokens(payload);
            await this.tokenService.saveToken({userId: user.id, refreshToken: tokens.refreshToken});
            return {
                ...tokens,
                user
            };
        }
        
        throw new HttpException(`Роли для пользователя id ${user.id} не найдены`, HttpStatus.BAD_REQUEST);
    }

    private async validateUser(authUserDto: AuthUserDto) {
        const user = await this.getUserByPhone(authUserDto.phone);
        if(user) {
            if(!user.isActivated) {
                throw new UnauthorizedException({message: 'Номер телефона не был подтвержден смс кодом, запросите смс код'});
            }
        
            const passwordEquals = await bcrypt.compare(authUserDto.password, user.password);
            if(passwordEquals) {
                return user;
            }
        }

        throw new UnauthorizedException({message: 'Некорректный номер телефона или пароль'})
    }

    async checkUserExistByPhone(phone: string) {
        if(await this.getUserByPhone(phone)) {
            return true;
        }
        
        throw new HttpException({message:`${'Пользователь с номером ' + phone + ' не зарегистрирован'}`}, HttpStatus.NOT_FOUND);
    }

    async checkUserNotExistByPhone(phone: string) {
        const user = await this.getUserByPhone(phone);
        if (user) {
            throw new HttpException({message:`${'Пользователь с номером ' + phone + ' уже зарегистрирован'}`}, HttpStatus.NOT_FOUND);
        }
        
        return true;
    }

    async checkUserNotExistByEmailAndPhone(phone: string, email: string) {
        const userExistByEmail = await this.getUserByEmail(email)
        if (userExistByEmail) {
            throw new HttpException(`Пользователь c email ${userExistByEmail.email} уже существует !`, HttpStatus.BAD_REQUEST);
        }

        const userExistByPhone = await this.getUserByPhone(phone);
        if (userExistByPhone) {
            throw new HttpException(`Пользователь c номером телефона ${userExistByPhone.phone} уже существует!`, HttpStatus.BAD_REQUEST);
        }

        return true;
    }

    async getUserByEmail(email: string) {
        return await this.userRepo.findOne({ where: { email }, include: { all: true } });
    }

    async getUserByPhone(phone: string) {
        return await this.userRepo.findOne({ where: { phone }, include: { all: true } });
    }

    async getById(id: number) {
       return await this.userRepo.findOne({where: {id}, include: { all: true }});
    }

    async changePassword(userId: number, password: string) {
        if (!password) {
            throw new HttpException(`Пароль не заполнен`, HttpStatus.BAD_REQUEST);
        }

        if (!userId) {
            throw new HttpException(`Идентификатор пользователя не передан`, HttpStatus.BAD_REQUEST);
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const user = await this.getById(userId);
        if (!user) {
            throw new HttpException(`Пользователь не найден`, HttpStatus.BAD_REQUEST);
        }
        user.password = hashPassword;
        user.save();
        return true;
    }

    async changePhoneNumber(userId: number, phoneNumber: string) {
        if (!phoneNumber) {
            throw new HttpException(`Номер телефона не заполнен`, HttpStatus.BAD_REQUEST);
        }

        if (!userId) {
            throw new HttpException(`Идентификатор пользователя не передан`, HttpStatus.BAD_REQUEST);
        }
    
        const user = await this.getById(userId);
        if (!user) {
            throw new HttpException(`Пользователь не найден`, HttpStatus.BAD_REQUEST);
        }
        user.phone = phoneNumber;
        user.save();
        return true;
    }

    async changeEmail(userId: number, email: string) {
        if (!email) {
            throw new HttpException(`Email не заполнен`, HttpStatus.BAD_REQUEST);
        }

        if (!userId) {
            throw new HttpException(`Идентификатор пользователя не передан`, HttpStatus.BAD_REQUEST);
        }
        const user = await this.getById(userId);
        if (!user) {
            throw new HttpException(`Пользователь не найден`, HttpStatus.BAD_REQUEST);
        }
        user.email = email;
        user.save();
        return true;
    }

    async changeFio(userId: number, fio: string) {
        if (!fio) {
            throw new HttpException(`ФИО не заполнен`, HttpStatus.BAD_REQUEST);
        }

        if (!userId) {
            throw new HttpException(`Идентификатор пользователя не передан`, HttpStatus.BAD_REQUEST);
        }
        const user = await this.getById(userId);
        if (!user) {
            throw new HttpException(`Пользователь не найден`, HttpStatus.BAD_REQUEST);
        }
        user.fio = fio;
        user.save();
        return true;
    }

    async uploadAvatar(userId: number, image: BinaryData) {
        if (!userId) {
            throw new HttpException(`Идентификатор пользователя не передан`, HttpStatus.BAD_REQUEST);
        }
        
        const user = await this.getById(userId);
        if (!user) {
            throw new HttpException(`Пользователь не найден`, HttpStatus.BAD_REQUEST);
        }
        
        if (!image) {
            throw new HttpException(`Изображение не передано`, HttpStatus.BAD_REQUEST);
        }

        const fileName = await this.fileService.createFile(image, 'user-images');
        if (fileName) {
            user.avatar = fileName;
            user.save();
            return fileName;
        }    
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

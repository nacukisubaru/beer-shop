import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';

@Injectable()
export class FilesService {
    async createFile(file: any, folder: string = ''): Promise<string> {
        try {
            const fileName = uuid.v4() + '.jpg';
            const filePath = path.resolve(__dirname, '..', 'static', folder);
            if(!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, {recursive: true});
            }
            const link = path.join(filePath, fileName);
            fs.writeFileSync(link, file.buffer);

            const parsePath = path.parse(link);
            const filePathServer = process.env.API_URL + '/' + folder +'/'+parsePath.name + parsePath.ext;
            return filePathServer;
        } catch (e) {
            throw new HttpException('Произошла ошибка при записи файла', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

import { Module } from '@nestjs/common';
import { FilesService } from './filtes.service';

@Module({
    providers: [FilesService],
    exports: [FilesService]
})
export class FilesModule {}

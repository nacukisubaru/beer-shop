import { PartialType } from '@nestjs/swagger';
import { CreateSnackDto } from './create-snack.dto';

export class UpdateSnackDto extends PartialType(CreateSnackDto) {}

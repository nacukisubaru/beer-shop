import { PartialType } from '@nestjs/swagger';
import { CreateTypePackagingDto } from './create-type-packaging.dto';

export class UpdateTypePackagingDto extends PartialType(CreateTypePackagingDto) {}

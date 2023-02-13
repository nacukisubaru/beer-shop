import { PartialType } from '@nestjs/swagger';
import { CreateFishTypeDto } from './create-fish-type.dto';

export class UpdateFishTypeDto extends PartialType(CreateFishTypeDto) {}

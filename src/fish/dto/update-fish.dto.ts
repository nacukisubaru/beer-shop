import { PartialType } from '@nestjs/swagger';
import { CreateFishDto } from './create-fish.dto';

export class UpdateFishDto extends PartialType(CreateFishDto) {
    id: number;
}

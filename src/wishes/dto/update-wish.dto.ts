import { PartialType } from '@nestjs/swagger';
import { CreateWishDto } from './create-wish.dto';
import { IsOptional } from 'class-validator';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsOptional() override raised?: never;
  @IsOptional() override owner?: never;
  @IsOptional() override offers?: never;
  @IsOptional() override copied?: never;
}

import { PartialType } from '@nestjs/swagger';
import { CreateWishDto } from './create-wish.dto';
import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  @IsString()
  @Length(1, 250)
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  link?: string;

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsString()
  @Length(1, 1024)
  @IsOptional()
  description?: string;

  @IsOptional() override raised?: never;
  @IsOptional() override owner?: never;
  @IsOptional() override offers?: never;
  @IsOptional() override copied?: never;
}

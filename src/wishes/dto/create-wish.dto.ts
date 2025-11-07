import {
  IsString,
  Length,
  IsUrl,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
export class CreateWishDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsUrl()
  link: string;

  @IsUrl()
  image: string;

  @IsNumber()
  price: number;

  @IsString()
  @Length(1, 1024)
  description: string;

  @IsOptional() raised?: never;
  @IsOptional() copied?: never;
  @IsOptional() owner?: never;
  @IsOptional() offers?: never;
}

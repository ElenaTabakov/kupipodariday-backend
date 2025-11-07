import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  IsUrl,
} from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsString()
  @Length(1, 1024)
  description: string;

  @IsUrl()
  image: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  items?: number[];
}

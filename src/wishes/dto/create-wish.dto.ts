import { IsString, Length, IsUrl, IsNumber, IsOptional } from 'class-validator';
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

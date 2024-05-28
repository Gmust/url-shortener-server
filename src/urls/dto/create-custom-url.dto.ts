import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCustomUrlDto {

  @IsNotEmpty({ message: 'Original url is required' })
  originalUrl: string;

  @IsOptional()
  @IsString()
  customName: string;

  @IsOptional()
  @IsDateString()
  expiresIn: string;

  @IsOptional()
  @IsNumber()
  maxClicks: number;

  @IsOptional()
  @IsBoolean()
  isActive: boolean;
}

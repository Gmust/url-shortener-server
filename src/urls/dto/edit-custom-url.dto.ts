import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';


export class EditCustomUrlDto {

  @IsNotEmpty()
  urlId: string;

  @IsOptional()
  @IsString()
  newOriginalUrl: string;

  @IsOptional()
  @IsString()
  newUrlId: string;

  @IsOptional()
  @IsNumber()
  newMaxClicks: number;

  @IsOptional()
  @IsDateString()
  newExpiresIn: string;
}

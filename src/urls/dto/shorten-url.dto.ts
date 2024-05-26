import { IsNotEmpty } from 'class-validator';

export class ShortenUrlDto {
  @IsNotEmpty({ message: 'Original url is required' })
  originalUrl: string;
}


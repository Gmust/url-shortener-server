import { IsEmail, IsNotEmpty } from 'class-validator';


export class RefreshTokenDto {

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  refresh_token: string;

}

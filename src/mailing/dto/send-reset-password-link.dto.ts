import { IsEmail, IsNotEmpty } from 'class-validator';


export class SendResetPasswordLinkDto {

  @IsNotEmpty()
  resetLink: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  surname: string

  @IsNotEmpty()
  @IsEmail()
  email:string

}

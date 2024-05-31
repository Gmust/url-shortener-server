import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {

  @IsNotEmpty()
  resetToken: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;

}

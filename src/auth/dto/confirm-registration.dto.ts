import { IsEmail, IsNotEmpty } from 'class-validator';

export class ConfirmRegistrationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  confirmationToken: string;
}

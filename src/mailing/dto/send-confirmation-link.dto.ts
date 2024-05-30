import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendConfirmMailDto {
  @ApiProperty({
    example: 'http://localhost:3000/confirm-account?token%3D%25242b%252410%2524BQ3tWYEvtjtxoFMervNjFuZ1JnSxnG6nwe%252FHnkDEok7qWecjF2d0.&source=gmail&ust=1706637135569000&usg=AOvVaw09bicmlD6CCS39RlOdN1BR',
    description: 'Provide confirmation ling which consist of token and user email',
    type: String,
  })
  @IsNotEmpty()
  link: string;

  @ApiProperty({
    example: 'Email confirmation',
    description: 'Subject of email',
    type: String,
  })
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'account-confirmation-template',
    description: 'Name of template file',
    type: String,
  })
  @IsNotEmpty()
  template: string;

  @ApiProperty({
    example: 'test@gmail.com',
    description: 'Email of sending mail',
    type: String,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

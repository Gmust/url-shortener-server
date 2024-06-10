import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';


export class SendNotificationDto {

  @ApiProperty({
    example: 'Subscription payment',
    description: 'Subject of email',
    type: String,
  })
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'Hello user',
    description: 'Text for user',
    type: String,
  })
  @IsNotEmpty()
  emailText: string;

  @ApiProperty({
    example: 'notification-template',
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

import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

import { Plan } from '../../types/Plan';

export class PayForSubscriptionDto {

  @ApiProperty({
    name: 'User email',
    description: 'Provide user email',
    example: 'test@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    name: 'Plan',
    description: 'Provide plan user want subscribe to',
    example: Plan.PREMIUM,
  })
  @IsNotEmpty()
  @IsEnum(Plan)
  plan: Plan;

  @ApiProperty({
    name: 'startDate',
    description: 'Provide date of subscription start (current user data)',
    example: new Date().toISOString(),
  })
  @IsDateString()
  startDate: string;
}

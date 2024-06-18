import { IsDate, IsEnum, IsNotEmpty } from 'class-validator';

import { User } from '../../schemas/user.schema';
import { Plan } from '../../types/Plan';


export class CreateSubscriptionDto {

  @IsNotEmpty()
  @IsEnum(Plan)
  plan: Plan;

  @IsNotEmpty()
  @IsDate()
  startDate: string;

  @IsNotEmpty()
  user: User;
}

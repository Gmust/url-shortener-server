import { IsDate, IsEnum, IsNotEmpty } from 'class-validator';

import { Plan } from '../../types/Plan';


export class CreateSubscriptionDto {

  @IsNotEmpty()
  @IsEnum(Plan)
  plan: Plan;

  @IsNotEmpty()
  @IsDate()
  startDate: string;

}

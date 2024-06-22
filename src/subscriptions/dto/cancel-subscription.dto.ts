import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CancelSubscriptionDto {

  @ApiProperty({
    type: mongoose.Types.ObjectId,
    example: '6672dd9f3124b5fe8de25fa1',
    description: 'user id',
    name: 'userId'
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;


}

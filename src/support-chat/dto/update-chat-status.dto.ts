import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

import { ChatStatus } from '../../types/SupportChat';


export class UpdateChatStatusDto {


  @ApiProperty({
    name: 'supportChatId',
    description: 'Id of support chat',
    example: '665dee65672b8deed0c1b278',
  })
  @IsNotEmpty()
  @IsMongoId()
  supportChatId: string;

  @ApiProperty({
    name: 'newStatus',
    description: 'New status for support chat',
    example: ChatStatus.INACTIVE,
  })
  @IsNotEmpty()
  @IsEnum(ChatStatus)
  newStatus: ChatStatus;

}

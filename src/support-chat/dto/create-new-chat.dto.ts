import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

import { ChatTopic } from '../../types/SupportChat';

export class CreateNewChatDto {
  @ApiProperty({
    name: 'UserId',
    description: 'User id who starts chat',
    example: '665dee65672b8deed0c1b278',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiProperty({
    name: 'Chat topic',
    description: 'Provided chat topic',
    example: ChatTopic.BUG_REPORT,
  })
  topic: ChatTopic;
}

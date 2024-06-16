import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

import { MessageType } from '../../types/Message';

export class CreateNewMessageDto {

  @ApiProperty({
    name: 'senderId',
    description: 'Id of the sender',
    example: '665dee66672b8dee124d0c2131b27a',
  })
  @IsNotEmpty()
  @IsMongoId()
  senderId: string;

  @ApiProperty({
    name: 'recipientId',
    description: 'Id of the recipient',
    example: '662145de51ee66672b8dee1212',
  })
  @IsNotEmpty()
  @IsMongoId()
  recipientId: string;

  @ApiProperty({
    name: 'messageType',
    description: 'Type of the message',
    example: MessageType.TEXT,
  })
  @IsNotEmpty()
  @IsEnum(MessageType)
  messageType: MessageType;

  @ApiProperty({
    name: 'content',
    description: 'Text message or image',
    example: 'My problem is....'
  })
  @IsNotEmpty()
  content: any;

  @ApiProperty({
    name: 'supportChatId',
    description: 'id of the support chat',
    example: '665dee65672b8deed0c1b278',
  })
  @IsNotEmpty()
  @IsMongoId()
  supportChatId: string;

}

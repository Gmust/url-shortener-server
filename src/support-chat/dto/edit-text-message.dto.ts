import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class EditTextMessageDto {


  @ApiProperty({
    name: 'messageId',
    description: 'Message id',
    example: '665dee65672b8deed0c1b278',
  })
  @IsNotEmpty()
  @IsMongoId()
  messageId: string;

  @ApiProperty({
    name: 'content',
    description: 'Updated text',
    example: '665dee65415672b8deed0c1b278',
  })
  @IsNotEmpty()
  content: string
}

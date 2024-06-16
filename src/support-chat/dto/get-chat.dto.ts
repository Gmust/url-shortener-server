import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GetChatDto {

  @ApiProperty({
    name: 'chatId',
    description: 'Id of the support chat',
    example: '665dee666723b8deed0wqec1b27adsa'
  })
  @IsNotEmpty()
  @IsMongoId()
  chatId: string

}

import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GetMessageDto {

  @ApiProperty({
    name: 'messageId',
    description: 'Id of the  message',
    example: '665dee666723b8deed0wqec1b27adsa',
  })
  @IsNotEmpty()
  @IsMongoId()
  messageId: string;

}

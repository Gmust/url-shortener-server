import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';


export class TakeSupportChatDto {
  @ApiProperty({
    name: 'supportMemberId',
    description: 'Support member Id who starts chat',
    example: '665dee65672b8deed0c1b278',
  })
  @IsNotEmpty()
  @IsMongoId()
  supportMemberId: string;

  @ApiProperty({
    name: 'supportChatId',
    description: 'Id of support chat',
    example: '665dee65672b8deed0c1b278',
  })
  @IsNotEmpty()
  @IsMongoId()
  supportChatId: string;
}

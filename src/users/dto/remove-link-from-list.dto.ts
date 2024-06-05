import { IsMongoId, IsNotEmpty } from 'class-validator';

export class RemoveLinkFromListDto {

  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @IsNotEmpty()
  @IsMongoId()
  linkId: string;

}

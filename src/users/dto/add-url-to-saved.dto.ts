import { IsMongoId, IsNotEmpty } from 'class-validator';

import { UrlDocument } from '../../schemas/url.schema';


export class AddUrlToSavedDto {

  @IsNotEmpty()
  @IsMongoId()
  _id: string;

  @IsNotEmpty()
  url: UrlDocument;

}

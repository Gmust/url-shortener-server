import { IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

import { Url } from '../../schemas/url.schema';


export class AddUrlToSavedDto {

  @IsNotEmpty()
  _id: mongoose.Types.ObjectId;

  @IsNotEmpty()
  url: Url;

}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type UrlDocument = Url & Document;


@Schema({ timestamps: true, _id: true })
export class Url {
  @Prop({ required: [true, 'Url id is required!'], type: String })
  urlId: string;

  @Prop({ required: [true, 'Original url is required!'], type: String })
  originalUrl: string;

  @Prop({ required: [true, 'Short url is required!'], type: String })
  shortUrl: string;

  @Prop({ required: true, default: 0 })
  clicks: number;

  @Prop({ required: false })
  expiresIn: string;

  @Prop({ required: false })
  maxClicks: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const UrlSchema = SchemaFactory.createForClass(Url);

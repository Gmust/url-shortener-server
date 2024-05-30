import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId } from 'mongoose';


export type MessageDocument = Message & Document


@Schema({ timestamps: true })
export class Message {

  @Prop({ required: [true, 'Sender is required'], ref: 'User' })
  Sender: ObjectId;

  @Prop({ required: [true, 'Recipient is required'], ref: 'User' })
  recipient: ObjectId;

  @Prop({ required: [true, 'Content is required'] })
  content: string;

  @Prop({ required: false, ref: 'SupportChat' })
  supportChat: ObjectId;
}


export const MessageSchema = SchemaFactory.createForClass(Message);

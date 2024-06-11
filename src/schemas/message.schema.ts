import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';


export type MessageDocument = Message & Document


@Schema({ timestamps: { createdAt: true } })
export class Message {

  @Prop({ required: [true, 'Sender is required'], ref: 'User' })
  sender: mongoose.Types.ObjectId;

  @Prop({ required: [true, 'Recipient is required'], ref: 'User' })
  recipient: mongoose.Types.ObjectId;

  @Prop({ required: [true, 'Content is required'] })
  content: string;

  @Prop({ required: false, ref: 'SupportChat' })
  supportChat: mongoose.Types.ObjectId;
}


export const MessageSchema = SchemaFactory.createForClass(Message);

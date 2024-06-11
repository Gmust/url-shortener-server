import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { ChatStatus, ChatTopic } from '../types/SupportChat';

export type SupportChatDocument = SupportChat & Document

@Schema()
export class SupportChat {

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }] })
  participants: mongoose.Types.ObjectId[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: [] }] })
  messages: mongoose.Types.ObjectId[];

  @Prop({ required: [true, 'Status is required'], enum: ChatStatus, default: ChatStatus.ACTIVE })
  status: ChatStatus;

  @Prop({ required: [true, 'Topic is required'], enum: ChatTopic })
  topic: ChatTopic;

}


export const SupportChatSchema = SchemaFactory.createForClass(SupportChat);

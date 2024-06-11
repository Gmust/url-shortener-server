import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Message } from '../schemas/message.schema';
import { SupportChat } from '../schemas/support-chat.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class SupportChatService {

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(SupportChat.name) private supportChatModel: Model<SupportChat>,
    private userService: UsersService,
  ) {
  }


  async createNewChat( ){

  }


}

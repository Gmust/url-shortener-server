import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Message } from '../schemas/message.schema';
import { SupportChat } from '../schemas/support-chat.schema';
import { ChatStatus } from '../types/SupportChat';
import { UsersService } from '../users/users.service';
import { ErrorMessages } from '../utils/strings';
import { CreateNewChatDto } from './dto/create-new-chat.dto';
import { TakeSupportChatDto } from './dto/take-support-chat.dto';
import { UpdateChatStatusDto } from './dto/update-chat-status.dto';

@Injectable()
export class SupportChatService {

  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(SupportChat.name) private supportChatModel: Model<SupportChat>,
    private userService: UsersService,
  ) {
  }


  async createNewChat({ userId, topic }: CreateNewChatDto) {
    const user = await this.userService.findUser({ _id: userId });
    if (!user) {
      throw new BadRequestException(ErrorMessages['404']);
    }

    const newChat = await this.supportChatModel.create({
      topic: topic,
      participants: [user._id],
    });

    if (!newChat) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong);
    }

    return {
      message: 'New support chat successfully started',
      newSupportChat: newChat,
    };
  }

  async takeSupportChat({ supportMemberId, supportChatId }: TakeSupportChatDto) {
    const supportMember = await this.userService.findUser({ _id: supportMemberId });
    if (!supportMember) {
      throw new BadRequestException('Invalid  support member id');
    }

    const chat = await this.supportChatModel.findById(supportChatId);
    if (!chat) {
      throw new BadRequestException(ErrorMessages['404']);
    }

    chat.participants.push(supportMember._id);
    chat.status = ChatStatus.ACTIVE;
    await chat.save();

    return {
      message: 'Chat has been successfully taken',
    };
  }

  async updateChatStatus({ supportChatId, newStatus }: UpdateChatStatusDto) {
    const chat = await this.supportChatModel.findById(supportChatId);
    if (!chat) {
      throw new BadRequestException(ErrorMessages['404']);
    }

    chat.status = newStatus;
    chat.save();

    return {
      message: 'Chat status successfully updated',
      updatedChat: chat,
    };
  }

}

import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Message } from '../schemas/message.schema';
import { SupportChat } from '../schemas/support-chat.schema';
import { ChatStatus } from '../types/SupportChat';
import { UsersService } from '../users/users.service';
import { ErrorMessages } from '../utils/strings';
import { CreateNewChatDto } from './dto/create-new-chat.dto';
import { CreateNewMessageDto } from './dto/create-new-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { EditTextMessageDto } from './dto/edit-text-message.dto';
import { GetChatDto } from './dto/get-chat.dto';
import { GetMessageDto } from './dto/get-message.dto';
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


  async getSupportChat({ chatId }: GetChatDto) {
    const supportChat = await this.supportChatModel.findById(chatId);
    if (!supportChat) {
      throw new BadRequestException('Invalid chat id');
    }
    return supportChat;
  }

  async getMessage({ messageId }: GetMessageDto) {
    const message = await this.messageModel.findById(messageId).populate('sender recipient supportChat');
    if (!message) {
      throw new BadRequestException('Invalid message id');
    }
    return message;
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

    if (chat.participants.find(id => String(id) == supportMemberId)) {
      throw new BadRequestException('You have already taken this ticket!');
    }

    chat.participants.push(supportMember._id);
    chat.status = ChatStatus.ACTIVE;
    await chat.save();

    return {
      message: 'Chat has been successfully taken',
      chat,
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

  async createNewMessage({ messageType, supportChatId, recipientId, senderId, content }: CreateNewMessageDto) {
    const recipient = await this.userService.findUser({ _id: recipientId });
    const sender = await this.userService.findUser({ _id: senderId });
    const supportChat = await this.getSupportChat({ chatId: supportChatId });

    const newMessage = await this.messageModel.create({
      messageType,
      sender,
      recipient,
      supportChat,
      content,
    });

    if (!newMessage) {
      throw new BadRequestException(ErrorMessages.SmthWentWrong);
    }

    await this.supportChatModel.findOneAndUpdate(
      { _id: supportChatId },
      { $push: { messages: newMessage._id } },
      { new: true },
    );

    return newMessage;
  }

  async editMessage({ messageId, content }: EditTextMessageDto) {
    const message = await this.getMessage({ messageId });
    message.content = content;
    message.isUpdated = true;

    await message.save();

    return message;
  }

  async deleteMessage({ messageId }: DeleteMessageDto) {
    const message = await this.messageModel.findOneAndDelete({ _id: messageId }).populate('supportChat');
    if (!message) {
      throw new BadRequestException(ErrorMessages.SmthWentWrong);
    }

    return {
      message: 'Message successfully deleted',
      messageId: messageId,
      chatId: message.supportChat._id,
    };
  }

  async deleteClosedChats() {
    return this.supportChatModel.deleteMany({ status: ChatStatus.CLOSED });
  }

}

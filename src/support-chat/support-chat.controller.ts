import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { AuthGuard } from '../auth/guard/auth.guard';
import { RoleGuard } from '../roles/guard/role.guard';
import { Roles } from '../roles/roles.decorator';
import { SubscriptionGuard } from '../subscriptions/guard/subscription.guard';
import { Subscriptions } from '../subscriptions/subscriptions.decorator';
import { Plan } from '../types/Plan';
import { RolesEnum } from '../types/User';
import { ErrorMessages } from '../utils/strings';
import { CreateNewChatDto } from './dto/create-new-chat.dto';
import { CreateNewMessageDto } from './dto/create-new-message.dto';
import { EditTextMessageDto } from './dto/edit-text-message.dto';
import { TakeSupportChatDto } from './dto/take-support-chat.dto';
import { UpdateChatStatusDto } from './dto/update-chat-status.dto';
import { SupportChatGateway } from './support-chat.gateway';
import { SupportChatService } from './support-chat.service';

@Controller('support-chat')
export class SupportChatController {

  constructor(private supportChatService: SupportChatService, private supportChatGateway: SupportChatGateway) {
  }


  @Subscriptions(Plan.PREMIUM, Plan.ADMIN)
  @UseGuards(SubscriptionGuard, AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getSupportChat(@Param('id') id: string) {
    try {
      return this.supportChatService.getSupportChat({ chatId: id });
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, e);
    }
  }


  @Subscriptions(Plan.PREMIUM, Plan.ADMIN)
  @UseGuards(SubscriptionGuard, AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('')
  async createNewSupportChat(@Body() createNewChatDto: CreateNewChatDto) {
    try {
      return this.supportChatService.createNewChat(createNewChatDto);
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, e);
    }
  }


  @Roles(RolesEnum.SUPPORT, RolesEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @Post('take')
  async takeSupportChat(@Body() takeSupportChatDto: TakeSupportChatDto) {
    try {
      const { chat, message } = await this.supportChatService.takeSupportChat(takeSupportChatDto);
      this.supportChatGateway.handleStatus({
        supportChatId: String(chat._id),
        newStatus: chat.status,
      });

      return {
        message,
      };
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, e);
    }
  }

  @Roles(RolesEnum.SUPPORT, RolesEnum.ADMIN)
  @UseGuards(AuthGuard, RoleGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('update-status')
  async updateChatStatus(@Body() updateChatStatusDto: UpdateChatStatusDto) {
    try {
      const { updatedChat, message } = await this.supportChatService.updateChatStatus(updateChatStatusDto);
      await this.supportChatService.updateChatStatus({
        supportChatId: String(updatedChat._id),
        newStatus: updatedChat.status,
      });

      return {
        message,
      };
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, e);
    }
  }

  @Subscriptions(Plan.PREMIUM, Plan.ADMIN)
  @UseGuards(AuthGuard, SubscriptionGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/message')
  async createNewMessage(@Body() createNewMessageDto: CreateNewMessageDto) {
    try {
      const newMessage = await this.supportChatService.createNewMessage(createNewMessageDto);
      this.supportChatGateway.handleNewMessage({
        _id: String(newMessage._id),
        supportChatId: String(newMessage.supportChat),
        messageType: newMessage.messageType,
        content: newMessage.content,
        senderId: String(newMessage.sender._id),
        recipientId: String(newMessage.recipient._id),
        chatId: String(newMessage.supportChat._id),
      });

      return newMessage;
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, e);
    }
  }


  @Subscriptions(Plan.PREMIUM, Plan.ADMIN)
  @UseGuards(AuthGuard, SubscriptionGuard)
  @HttpCode(HttpStatus.CREATED)
  @Patch('/message/update')
  async updateChatMessage(@Body() editTextMessageDto: EditTextMessageDto) {
    try {
      const updatedMessage = await this.supportChatService.editMessage(editTextMessageDto);
      this.supportChatGateway.editChatMessage({
        messageId: String(updatedMessage._id),
        content: updatedMessage.content,
        isUpdated: updatedMessage.isUpdated,
        chatId: String(updatedMessage.supportChat._id),
      });

      return updatedMessage;
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, e);
    }
  }

  @Subscriptions(Plan.PREMIUM, Plan.ADMIN)
  @UseGuards(AuthGuard, SubscriptionGuard)
  @HttpCode(HttpStatus.CREATED)
  @Delete('/message/delete/:id')
  async deleteChatMessage(@Param('id') id: string) {
    try {
      const { message, messageId, chatId } = await this.supportChatService.deleteMessage({ messageId: id });
      this.supportChatGateway.deleteChatMessage({ messageId, chatId: String(chatId) });

      return {
        message,
      };
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, e);

    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteClosedChats() {
    return this.supportChatService.deleteClosedChats();
  }
}

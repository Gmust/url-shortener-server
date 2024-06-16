import {
  Body,
  Controller,
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
import { TakeSupportChatDto } from './dto/take-support-chat.dto';
import { UpdateChatStatusDto } from './dto/update-chat-status.dto';
import { SupportChatService } from './support-chat.service';

@Controller('support-chat')
export class SupportChatController {

  constructor(private supportChatService: SupportChatService) {
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
      return this.supportChatService.takeSupportChat(takeSupportChatDto);
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
      return this.supportChatService.updateChatStatus(updateChatStatusDto);
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, e);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deleteClosedChats() {
    return this.supportChatService.deleteClosedChats();
  }


}

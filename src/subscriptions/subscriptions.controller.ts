import { Body, Controller, HttpCode, HttpStatus, InternalServerErrorException, Post, UseGuards } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { AuthGuard } from '../auth/guard/auth.guard';
import { ErrorMessages } from '../utils/strings';
import { PayForSubscriptionDto } from './dto/pay-for-subscription.dto';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {

  constructor(private subscriptionsService: SubscriptionsService) {
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('pay')
  async payForSubscription(@Body() payForSubscriptionDto: PayForSubscriptionDto) {
    try {
      return this.subscriptionsService.payForSubscription(payForSubscriptionDto);
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong);
    }
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateUserPlan(@Body() payForSubscriptionDto: PayForSubscriptionDto) {
    try {
      return this.subscriptionsService.updateUserSubscription(payForSubscriptionDto);
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong);
    }
  }


  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async notifyUsersBeforeSevenDays() {
    return this.subscriptionsService.notifyUsersBeforeSevenDays();
  }


}

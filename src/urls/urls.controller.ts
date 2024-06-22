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
  Redirect,
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
import { RemoveLinkFromListDto } from '../users/dto/remove-link-from-list.dto';
import { ErrorMessages } from '../utils/strings';
import { CreateCustomUrlDto } from './dto/create-custom-url.dto';
import { EditCustomUrlDto } from './dto/edit-custom-url.dto';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { UrlsService } from './urls.service';

@Controller('urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {
  }


  @Post('shorten')
  @HttpCode(HttpStatus.CREATED)
  async shortenUrl(@Body() shortenUrlDro: ShortenUrlDto) {
    try {
      return this.urlsService.shortenUrl(shortenUrlDro);
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, {
        cause: e,
      });
    }
  }

  @Subscriptions(Plan.PREMIUM, Plan.ADMIN)
  @UseGuards(AuthGuard, SubscriptionGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('shorten-custom')
  async createCustomUrlForUser(@Body() createCustomUrlDto: CreateCustomUrlDto) {
    try {
      return this.urlsService.createCustomUrl(createCustomUrlDto);
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, {
        cause: e,
      });
    }
  }


  @Patch('/:urlId/change-status')
  @HttpCode(HttpStatus.CREATED)
  async changeUrlStatus(@Param('urlId') urlId: string) {
    try {
      return this.urlsService.changeUrlStatus(urlId);
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, {
        cause: e,
      });
    }
  }


  @Patch('edit-custom-url')
  @HttpCode(HttpStatus.CREATED)
  async editCustomUrl(@Body() editCustomUrlDto: EditCustomUrlDto) {
    try {
      return this.urlsService.editCustomUrl(editCustomUrlDto);
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, {
        cause: e,
      });
    }
  }

  @Get('/:urlId')
  @Redirect('', 302)
  async getOriginalUrl(@Param('urlId') urlId: string) {
    try {
      const url = await this.urlsService.getOriginalUrl(urlId);
      return { url };
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, { cause: e });
    }
  }

  @Roles(RolesEnum.ADMIN, RolesEnum.SUPPORT)
  @Subscriptions(Plan.PREMIUM, Plan.ADMIN)
  @UseGuards(AuthGuard, RoleGuard, SubscriptionGuard)
  @Delete('/remove-link')
  async removeLink(@Body() removeLinkFromListDto: RemoveLinkFromListDto) {
    try {
      return this.urlsService.removeUrl(removeLinkFromListDto);
    } catch (e) {
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, { cause: e });
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  deleteAllExpiredLinks() {
    try {
      return this.urlsService.deleteAllExpiredLinks();
    } catch (e) {
      throw new InternalServerErrorException(e);
    }
  }

}

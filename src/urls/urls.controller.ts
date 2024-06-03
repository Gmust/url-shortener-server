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
  Redirect,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '../auth/guard/auth.guard';
import { SubscriptionGuard } from '../subscriptions/guard/subscription.guard';
import { Subscriptions } from '../subscriptions/subscriptions.decorator';
import { Plan } from '../types/Plan';
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

  // @Post('shorten-custom')
  // @HttpCode(HttpStatus.CREATED)
  // async createCustomUrl(@Body() createCustomUrlDto: CreateCustomUrlDto) {
  //   try {
  //     return this.urlsService.createCustomUrl(createCustomUrlDto);
  //   } catch (e) {
  //     throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, {
  //       cause: e,
  //     });
  //   }
  // }

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


}

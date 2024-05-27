import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Redirect,
} from '@nestjs/common';

import { ErrorMessages } from '../utils/strings';
import { CreateCustomUrlDto } from './dto/create-custom-url.dto';
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

  @Post('shorten-custom')
  @HttpCode(HttpStatus.CREATED)
  async createCustomUrl(@Body() createCustomUrlDto: CreateCustomUrlDto) {
    try {
      return this.urlsService.createCustomUrl(createCustomUrlDto);
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

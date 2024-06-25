import { Controller, Get, InternalServerErrorException, Param, Redirect, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

import { AppService } from './app.service';
import { UrlsService } from './urls/urls.service';
import { ErrorMessages } from './utils/strings';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private urlsService: UrlsService) {
  }

  @Get('/url/:urlId')
  @Redirect('', 302)
  async getOriginalUrl(@Param('urlId') urlId: string) {
    try {
      const url = await this.urlsService.getOriginalUrl(urlId);
      return { url };
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException(ErrorMessages.SmthWentWrong, { cause: e });
    }
  }

  @Get('test-image')
  getImage(@Res() res: Response) {
    res.sendFile(join(__dirname, '..', 'public', 'test.jpg'));
  }

}

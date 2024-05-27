import { Controller, Get, InternalServerErrorException, Param, Redirect } from '@nestjs/common';

import { AppService } from './app.service';
import { UrlsService } from './urls/urls.service';
import { ErrorMessages } from './utils/strings';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private urlsService: UrlsService) {
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

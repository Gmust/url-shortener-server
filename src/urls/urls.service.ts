import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';

import { Url } from '../schemas/url.schema';
import { validateOriginalUrl } from '../utils/validateOriginalUrl';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Injectable()
export class UrlsService {

  constructor(@InjectModel(Url.name) private urlModel: Model<Url>) {
  }

  public async shortenUrl({ originalUrl }: ShortenUrlDto) {
    if (!validateOriginalUrl(originalUrl)) {
      throw new BadRequestException('Invalid url', {
        cause: new Error(),
        description: 'Provide valid url',
      });
    }

    let url;
    url = await this.urlModel.findOne({ originalUrl });

    if (url) {
      return url;
    } else {

      const urlId = nanoid();

      const shortenedUrl = `${process.env.BASE_URL}/${urlId}`;
      url = await this.urlModel.create({
        originalUrl: originalUrl,
        shortUrl: shortenedUrl,
        urlId,
      });

      return {
        url: url,
        message: 'Url successfully shortened',
      };
    }
  }

  async getOriginalUrl(urlId: string) {
    if (!urlId) {
      throw new BadRequestException('Provide id');
    }
    const url = await this.urlModel.findOne({ urlId });
    if (url) {
      await this.urlModel.updateOne({ urlId }, { $inc: { clicks: 1 } });
      return url.originalUrl;
    } else {
      throw new BadRequestException('Something bad happened', {
        cause: new Error(),
        description: 'Some error description',
      });
    }
  }

}

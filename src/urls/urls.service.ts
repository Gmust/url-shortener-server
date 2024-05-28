import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';
import * as process from 'process';

import { Url } from '../schemas/url.schema';
import { validateOriginalUrl } from '../utils/validateOriginalUrl';
import { CreateCustomUrlDto } from './dto/create-custom-url.dto';
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

    const dbUrl = await this.urlModel.findOne({ originalUrl });

    if (dbUrl) {
      return dbUrl;
    } else {
      const { urlId, shortenedUrl } = await this.generateShortenedUrl(originalUrl);
      const url = await this.urlModel.create({
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

  public async createCustomUrl({ originalUrl, customName, maxClicks, expiresIn }: CreateCustomUrlDto) {
    if (!validateOriginalUrl(originalUrl)) {
      throw new BadRequestException('Invalid url', {
        cause: new Error(),
        description: 'Provide valid url',
      });
    }

    if (new Date(expiresIn).getTime() + 100 * 60 < new Date().getTime()) {
      throw new BadRequestException('Link can`not expire in the past');
    }

    const dbUrl = await this.urlModel.findOne({ originalUrl, urlId: customName.split(' ').join('-') });
    if (dbUrl) {
      return dbUrl;
    } else {
      const { urlId, shortenedUrl } = await this.generateShortenedUrl(customName);

      const newUrl = await this.urlModel.create({
        originalUrl,
        shortUrl: shortenedUrl,
        urlId,
      });

      if (expiresIn) {
        newUrl.expiresIn = expiresIn;
      }
      if (maxClicks) {
        newUrl.maxClicks = maxClicks;
      }

      await newUrl.save();

      return {
        url: newUrl,
        message: 'Url successfully shortened',
      };
    }
  }


  private async generateShortenedUrl(urlId?: string) {
    let id: string = '';

    if (!urlId) {
      id = nanoid();
    } else {
      id = urlId.split(' ').join('-');
    }
    const shortenedUrl = `${process.env.BASE_URL}/${id}`;
    return {
      shortenedUrl,
      urlId: id,
    };
  }

  async getOriginalUrl(urlId: string) {
    if (!urlId) {
      throw new BadRequestException('Provide id');
    }
    const url = await this.urlModel.findOne({ urlId });


    if (url) {
      if (this.isUrlExpiredOrMaxClicksReached(url)) {
        return `${process.env.FONTEND_URL}/link/error`;
      }

      await this.urlModel.updateOne({ urlId }, { $inc: { clicks: 1 } });
      return url.originalUrl;
    } else {
      throw new BadRequestException('Something bad happened', {
        cause: new Error(),
      });
    }
  }

  isUrlExpiredOrMaxClicksReached(url: Url): boolean {
    const isExpired = url.expiresIn && new Date(url.expiresIn).getTime() < new Date().getTime();
    const isMaxClicksReached = url.maxClicks && url.clicks >= url.maxClicks;
    return isExpired || isMaxClicksReached as boolean;
  }

}

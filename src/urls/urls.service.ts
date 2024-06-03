import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { nanoid } from 'nanoid';

import { Url } from '../schemas/url.schema';
import { UsersService } from '../users/users.service';
import { checkExpiration } from '../utils/checkExpiration';
import { ErrorMessages } from '../utils/strings';
import { validateOriginalUrl } from '../utils/validateOriginalUrl';
import { CreateCustomUrlDto } from './dto/create-custom-url.dto';
import { EditCustomUrlDto } from './dto/edit-custom-url.dto';
import { ShortenUrlDto } from './dto/shorten-url.dto';

@Injectable()
export class UrlsService {

  constructor(@InjectModel(Url.name) private urlModel: Model<Url>, private usersService: UsersService) {
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

  public async createCustomUrl({
                                 originalUrl,
                                 customName,
                                 maxClicks,
                                 expiresIn,
                                 isActive,
                                 saveLink,
                                 userId,
                               }: CreateCustomUrlDto) {

    if (!validateOriginalUrl(originalUrl)) {
      throw new BadRequestException('Invalid url', {
        cause: new Error(),
        description: 'Provide valid url',
      });
    }

    if (checkExpiration(expiresIn)) {
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
      if (isActive) {
        newUrl.isActive = isActive;
      }

      await newUrl.save();

      if (saveLink) {
        await this.usersService.addUrlToSaved({ url: newUrl, _id: userId });
      }

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
      if (this.isUrlExpiredOrMaxClicksReachedOrActive(url)) {
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

  public isUrlExpiredOrMaxClicksReachedOrActive(url: Url): boolean {
    const isExpired = url.expiresIn && new Date(url.expiresIn).getTime() < new Date().getTime();
    const isMaxClicksReached = url.maxClicks && url.clicks >= url.maxClicks;
    const isActive = url.isActive && !url.isActive;
    return isExpired || isMaxClicksReached || isActive as boolean;
  }

  public async changeUrlStatus(urlId: string) {

    const url = await this.urlModel.findOne({ urlId });
    if (!url) {
      throw new BadRequestException(ErrorMessages['404'], { description: 'Can not find URL according to provided url' });
    }
    url.isActive = !url.isActive;
    await url.save({ validateBeforeSave: false });

    return {
      url,
      message: 'Url status successfully changed',
    };
  }

  public async editCustomUrl({ newUrlId, newMaxClicks, newExpiresIn, urlId, newOriginalUrl }: EditCustomUrlDto) {
    if (newOriginalUrl && !validateOriginalUrl(newOriginalUrl)) {
      throw new BadRequestException('Invalid url', {
        cause: new Error(),
        description: 'Provide valid url',
      });
    }

    if (checkExpiration(newExpiresIn)) {
      throw new BadRequestException('Link can`not expire in the past');
    }

    const url = await this.urlModel.findOne({ urlId });
    if (!url) {
      throw new BadRequestException(ErrorMessages['404'], { description: 'Can not find URL according to provided url' });
    }

    if (newExpiresIn) {
      url.expiresIn = newExpiresIn;
    }
    if (newOriginalUrl) {
      url.originalUrl = newOriginalUrl;
    }
    if (newUrlId) {
      url.urlId = newUrlId;
    }
    if (newMaxClicks) {
      url.maxClicks = newMaxClicks;
    }
    await url.save({ validateBeforeSave: false });

    return {
      url,
      message: 'Url has been successfully updated!',
    };
  }

}

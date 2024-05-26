import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Url, UrlSchema } from '../schemas/url.schema';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';

@Module({
  imports: [MongooseModule.forFeature([{ schema: UrlSchema, name: Url.name }])],
  controllers: [UrlsController],
  providers: [UrlsService],
})
export class UrlsModule {
}

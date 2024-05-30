import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Subscription } from '../schemas/subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {

  constructor(@InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>) {
  }

  public async createNewSubscription({ startDate, plan }: CreateSubscriptionDto) {
    return this.subscriptionModel.create({ plan, startDate });
  }


}

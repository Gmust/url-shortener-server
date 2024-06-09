import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';

import { Subscription, SubscriptionDocument } from '../schemas/subscription.schema';
import { UsersService } from '../users/users.service';
import { checkExpiration } from '../utils/checkExpiration';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PayForSubscriptionDto } from './dto/pay-for-subscription.dto';

@Injectable()
export class SubscriptionsService {
  private stripe;


  constructor(@InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>, private usersService: UsersService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-04-10',
    });
  }

  public async createNewSubscription({ startDate, plan }: CreateSubscriptionDto) {
    return this.subscriptionModel.create({ plan, startDate });
  }

  public async updateUserSubscription({ startDate, plan, email }: PayForSubscriptionDto) {
    const user = await this.usersService.findUser({ email });
    if (!user) {
      throw new BadRequestException('Invalid email');
    }

    const subscription = await this.subscriptionModel.findById((user.subscription as SubscriptionDocument)._id);

    if (!subscription) {
      throw new BadRequestException('Invalid subscription id');
    }

    subscription.plan = plan;
    subscription.startDate = new Date(startDate);

    await subscription.save({ validateBeforeSave: false });

    return {
      message: 'Successfully subscribed',
    };
  }


  public async payForSubscription({ plan, email, startDate }: PayForSubscriptionDto) {

    if (checkExpiration(startDate)) {
      throw new BadRequestException('Cannot subscribe from the past');
    }

    const successUrl: string = `${process.env.FRONTEND_URL}/subscription/payment/success?email=${email}&plan=${plan}&startDate=${startDate}`;
    const cancelUrl: string = `${process.env.FRONTEND_URL}/subscription/payment/cancel`;

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_API_ID,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session.id;
  }
}

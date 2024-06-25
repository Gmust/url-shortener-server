import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';

import { MailingService } from '../mailing/mailing.service';
import { Subscription } from '../schemas/subscription.schema';
import { UsersService } from '../users/users.service';
import { checkExpiration } from '../utils/checkExpiration';
import { emailTexts, ErrorMessages } from '../utils/strings';
import { CancelSubscriptionDto } from './dto/cancel-subscription.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { PayForSubscriptionDto } from './dto/pay-for-subscription.dto';

@Injectable()
export class SubscriptionsService {
  private stripe;


  constructor(
    @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
    private usersService: UsersService,
    private mailingService: MailingService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-04-10',
    });
  }

  public async createNewSubscription({ startDate, plan, user }: CreateSubscriptionDto) {
    return this.subscriptionModel.create({ plan, startDate, user });
  }

  public async finalizeSubscription({ email, plan, startDate }: PayForSubscriptionDto) {
    const user = await this.usersService.findUser({ email });
    if (!user) {
      throw new BadRequestException('Invalid email');
    }

    const customerList = await this.stripe.customers.list({ email });
    if (customerList.data.length === 0) {
      throw new BadRequestException('Customer not found');
    }

    const stripeCustomer = customerList.data[0];

    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: stripeCustomer.id,
      type: 'card',
    });

    if (paymentMethods.data.length === 0) {
      throw new BadRequestException('No payment method attached to the customer');
    }

    const stripeSubscription = await this.stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ plan: process.env.STRIPE_API_ID }],
      default_payment_method: paymentMethods.data[0].id,
    });

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    return this.subscriptionModel.create({
      plan,
      startDate: new Date(startDate),
      endDate,
      user,
      stripeSubscriptionId: stripeSubscription.id,
    });
  }

  // public async updateUserSubscription({ startDate, plan, email }: PayForSubscriptionDto) {
  //   const user = await this.usersService.findUser({ email });
  //   if (!user) {
  //     throw new BadRequestException('Invalid email');
  //   }
  //
  //   const subscription = await this.subscriptionModel.findById((user.subscription as SubscriptionDocument)._id);
  //
  //   if (!subscription) {
  //     throw new BadRequestException('Invalid subscription id');
  //   }
  //
  //   const endDate = new Date();
  //   endDate.setDate(endDate.getDate() + 30);
  //
  //   subscription.plan = plan;
  //   subscription.startDate = new Date(startDate);
  //   subscription.endDate = endDate;
  //
  //   await subscription.save({ validateBeforeSave: false });
  //
  //   return {
  //     message: 'Successfully subscribed',
  //   };
  // }

  public async payForSubscription({ plan, email, startDate }: PayForSubscriptionDto) {
    if (checkExpiration(startDate)) {
      throw new BadRequestException('Cannot subscribe from the past');
    }

    const customerList = await this.stripe.customers.list({ email });
    let customer: Stripe.Customer;

    if (customerList.data.length === 0) {
      customer = await this.stripe.customers.create({ email });
    } else {
      customer = customerList.data[0];
    }

    const successUrl = `${process.env.FRONTEND_URL}/subscription/payment/success?email=${email}&plan=${plan}&startDate=${startDate}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/subscription/payment/cancel`;

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_API_ID,
          quantity: 1,
        },
      ],
      customer: customer.id,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return { sessionId: session.id };
  }

  public async notifyUsersBeforeSevenDays() {
    const currentDate = new Date();
    const targetDate = new Date(currentDate.setDate(currentDate.getDate() + 7));
    targetDate.setHours(0, 0, 0, 0);

    const subscriptions = await this.subscriptionModel.find({
      endDate: {
        $gte: targetDate,
        $lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000),
      },
    }).populate('user');

    subscriptions.map(async (subscription) =>
      this.mailingService.sendNotificationEmail({
        subject: 'Subscription reminder',
        emailText: emailTexts.SubscriptionReminder,
        email: subscription.user.email,
        template: 'subscription-reminder-template',
      }),
    );
  }

  public async cancelSubscription({ userId }: CancelSubscriptionDto) {
    const user = await this.usersService.findUser({ _id: userId });
    const subscription = await this.subscriptionModel.findOne({
      user: user,
    });

    if (!subscription) {
      throw new NotFoundException(ErrorMessages.SmthWentWrong);
    }


  }

}

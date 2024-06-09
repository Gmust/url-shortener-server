import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from '../auth/auth.module';
import { Subscription, SubscriptionSchema } from '../schemas/subscription.schema';
import { UsersModule } from '../users/users.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Subscription.name,
      schema: SubscriptionSchema,
    }]),
    forwardRef(()=>  UsersModule),
    forwardRef(()=>  AuthModule),
  ],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
  controllers: [SubscriptionsController],
})
export class SubscriptionsModule {
}

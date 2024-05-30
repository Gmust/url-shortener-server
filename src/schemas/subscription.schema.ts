import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { Plan } from '../types/Plan';


export type SubscriptionDocument = Subscription & Document;

@Schema()
export class Subscription {
  @Prop({ required: [true, 'Plan is required'], enum: Plan, default: Plan.FREE })
  plan: Plan;

  @Prop({ required: [true, 'Start date is required'] })
  startDate: Date;

  @Prop({
    required: function() {
      return this.plan !== Plan.FREE;
    },
    validate: {
      validator: function(value: Date) {
        return this.plan === Plan.FREE || (value && value > this.startDate);
      },
      message: 'Enda date must be after the start date for non-free plans',
    },
  })
  endDate: Date;
}


export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

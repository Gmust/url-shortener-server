import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { IsStrongPassword } from 'class-validator';
import mongoose, { Document } from 'mongoose';

import { Roles } from '../types/User';
import { Subscription } from './subscription.schema';
import { Url } from './url.schema';


export type UserDocument = User & Document

@Schema()
export class User {

  @Prop({
    required: [true, 'Email is required'],
    validate: {
      validator: (value: string) => /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(value),
      message: 'Invalid email format',
    },
    unique: true,
  })
  email: string;

  @Prop({
    required: false,
    validate: {
      validator: (value: string) => /^[A-Za-z]+$/.test(value),
      message: 'Name should be text string',
    },
  })
  name: string;

  @Prop({
    required: false,
    validate: {
      validator: (value: string) => /^[A-Za-z]+$/.test(value),
      message: 'Surname should be text string',
    },
  })
  surname: string;

  @Prop({ required: [true, 'Password is required'] })
  @IsStrongPassword()
  password: string;

  @Prop({ default: '' })
  confirmationToken: string;

  @Prop({
    type: String,
    default: '',
  })
  resetPasswordToken: string;

  @Prop({ type: mongoose.Schema.Types.Date, default: null })
  resetPasswordExpires: Date | null;
  
  @Prop({ type: mongoose.Types.ObjectId, default: [], ref: 'Url' })
  createdUrls: Url[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: false })
  subscription: Subscription;

  @Prop({ required: [true, 'Roles is required'], enum: Roles, default: Roles.USER })
  role: Roles;

  @Prop({ default: false })
  isConfirmed: boolean;

  createPasswordResetToken: () => Promise<string>;

  createConfirmationToken: () => Promise<string>;

}


export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.createPasswordResetToken = async function() {
  const generateResetToken = async () => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('resetToken', salt);
      const encodedToken = encodeURIComponent(hash);
      return encodedToken;
    } catch (err) {
      throw err;
    }
  };

  const resetToken = await generateResetToken();
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpires = new Date().getTime() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.methods.createConfirmationToken = async function() {
  const generateConfirmationToken = async () => {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('confirmToken', salt);
      const encodedToken = encodeURIComponent(hash);
      return encodedToken;
    } catch (err) {
      throw err;
    }
  };

  const confirmationToken = await generateConfirmationToken();
  this.confirmationToken = confirmationToken;

  return confirmationToken;
};


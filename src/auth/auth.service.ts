import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { MailingService } from '../mailing/mailing.service';
import { User } from '../schemas/user.schema';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { Plan } from '../types/Plan';
import { UsersService } from '../users/users.service';
import { jwtConstants } from './constants';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private mailingService: MailingService,
    private subscriptionService: SubscriptionsService,
  ) {
  }


  public async signIn({ password, email }: SignInDto) {

    const user = await this.userService.findUser({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.isConfirmed != true) {
      throw new UnauthorizedException('Confirm your account before logging in');
    }

    const access_token = await this.generateAccessToken(user);
    const refresh_token = await this.generateRefreshToken(user._id);

    return {
      user,
      access_token,
      refresh_token,
    };
  }

  private async generateAccessToken(user: User) {
    return this.jwtService.signAsync({ user }, { expiresIn: '15m', secret: jwtConstants.secret });
  }

  private async generateRefreshToken(userId: mongoose.Types.ObjectId) {
    return this.jwtService.signAsync({ userId }, { expiresIn: '7d', secret: jwtConstants.secret });
  }


  public async signUp({ name, surname, password, email }: SignUpDto) {
    const newUser = await this.userService.createUser({ name, surname, password, email });
    const confirmationToken = await newUser.createConfirmationToken();
    const newSubscription = await this.subscriptionService.createNewSubscription({
      plan: Plan.FREE,
      startDate: new Date().toISOString(),
    });

    const confirmationLink = `${process.env.FRONTEND_URL}/auth/confirm-account?token=${confirmationToken}&email=${newUser.email}`;

    newUser.confirmationToken = confirmationToken;
    newUser.subscription = newSubscription;
    await newUser.save();

    await this.mailingService.sendConfirmationLink({
      email,
      link: confirmationLink,
      subject: 'Account confirmation',
      template: 'account-confirmation-template',
    });

    return {
      message: 'User successfully created! Confirmation link has been  sent to your email!',
    };

  }
}

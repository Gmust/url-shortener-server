import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';

import { MailingService } from '../mailing/mailing.service';
import { User } from '../schemas/user.schema';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { Plan } from '../types/Plan';
import { UsersService } from '../users/users.service';
import { ErrorMessages } from '../utils/strings';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
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
    return this.jwtService.signAsync({ user }, { expiresIn: '15m', secret: process.env.JWT_SECRET });
  }

  private async generateRefreshToken(userId: mongoose.Types.ObjectId) {
    return this.jwtService.signAsync({ userId }, { expiresIn: '7d', secret: process.env.JWT_SECRET });
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

  public async confirmAccountRegistration({ confirmationToken, email }: ConfirmRegistrationDto) {
    const user = await this.userService.findUser({ email });
    if (user && user.confirmationToken === confirmationToken) {
      user.isConfirmed = true;
      user.confirmationToken = '';
      user.save({ validateBeforeSave: false });
      return {
        message: 'Account successfully confirmed! Now you can log in!',
      };
    } else {
      throw new BadRequestException('Something went wrong,  please contact to our support');
    }
  }

  private async validateToken(token: string) {
    return this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
  }

  public async getUserByToken(token: string) {
    const parsedToken = await this.jwtService.decode(token);
    const user = await this.userService.findUser({ email: parsedToken.user.email });

    return user;
  }


  public async refreshToken({ refresh_token, email }: RefreshTokenDto) {
    const validatedToken = await this.validateToken(refresh_token);
    const user = await this.userService.findUser({ email });
    if (!user || !validatedToken) {
      throw new BadRequestException(ErrorMessages.SmthWentWrong);
    }
    const newAccessToken = await this.generateAccessToken(user);
    if (validatedToken.error) {
      if (validatedToken.error === 'jwt expired') {
        const refresh = this.generateRefreshToken(user._id);
        return { access_token: newAccessToken, ...refresh };
      } else {
        return { error: validatedToken.error };
      }
    } else {
      return {
        access_token: newAccessToken,
        refresh_token: refresh_token,
      };
    }
  }

}

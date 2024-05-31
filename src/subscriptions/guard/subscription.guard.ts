import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AuthService } from '../../auth/auth.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {

  constructor(private reflector: Reflector, private authService: AuthService) {
  }

  private matchSubscriptions(subscriptions: string[], userSubscription: string) {
    return subscriptions.some((subscription) => subscription === userSubscription);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const subscriptions = this.reflector.get<string[]>('subscriptions', context.getHandler());
    if (!subscriptions) {
      return true; // No subscription required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const { authorization }: any = request.headers;

    if (!authorization) {
      throw new UnauthorizedException('Please provide a token in the Authorization header');
    }

    const authToken = authorization.replace(/bearer/gim, '').trim();

    try {
      const user = await this.authService.getUserByToken(authToken);

      if (!user) {
        throw new UnauthorizedException('Invalid token or user not found');
      }

      return this.matchSubscriptions(subscriptions, user.subscription.plan);
    } catch (error) {
      throw new UnauthorizedException('Invalid token or user not found');
    }
  }
}

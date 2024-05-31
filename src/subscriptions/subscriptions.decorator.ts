import { SetMetadata } from '@nestjs/common';

export const Subscriptions = (...args: string[]) => SetMetadata('subscriptions', args);

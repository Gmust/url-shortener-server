import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MailingModule } from './mailing/mailing.module';
import { RolesModule } from './roles/roles.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { SupportChatModule } from './support-chat/support-chat.module';
import { UrlsModule } from './urls/urls.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URL!, {
      dbName: process.env.DB_NAME,
    }),
    MailerModule.forRoot({
      transport: 'smtps://user@domain.com:pass@smtp.domain.com',
      template: {
        dir: process.cwd() + '/templates/',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    ScheduleModule.forRoot(),
    UrlsModule,
    UsersModule,
    AuthModule,
    MailingModule,
    SubscriptionsModule,
    RolesModule,
    SupportChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
}

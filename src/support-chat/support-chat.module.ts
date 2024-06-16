import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { multerConfig } from '../../multer.config';
import { AuthModule } from '../auth/auth.module';
import { Message, MessageSchema } from '../schemas/message.schema';
import { SupportChat, SupportChatSchema } from '../schemas/support-chat.schema';
import { UsersModule } from '../users/users.module';
import { SupportChatController } from './support-chat.controller';
import { SupportChatGateway } from './support-chat.gateway';
import { SupportChatService } from './support-chat.service';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MulterModule.register(multerConfig),
    MongooseModule.forFeature([
      {
        name: SupportChat.name,
        schema: SupportChatSchema,
      },
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
  ],
  providers: [SupportChatService, SupportChatGateway],
  controllers: [SupportChatController],
})
export class SupportChatModule {
}

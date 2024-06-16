import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { AuthService } from '../auth/auth.service';
import { CreateNewMessageDto } from './dto/create-new-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { EditTextMessageDto } from './dto/edit-text-message.dto';
import { UpdateChatStatusDto } from './dto/update-chat-status.dto';
import { SupportChatService } from './support-chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class SupportChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly userSockets: Map<string, Socket> = new Map();

  constructor(private supportChatService: SupportChatService, private authService: AuthService) {
  }

  async handleConnection(client: Socket): Promise<any> {
    const id = client.handshake.auth?.id || client.handshake.headers?.id;
    console.log(id);
    this.userSockets.set(id, client);
  }

  private getUserSocket(userId: string): Socket | undefined {
    return this.userSockets.get(userId);
  }

  handleDisconnect(client: Socket): any {
    for (const [userId, socket] of this.userSockets.entries()) {
      if (socket === client) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('new-chat-message')
  handleNewMessage(@MessageBody() payload: CreateNewMessageDto) {
    const { recipientId } = payload;
    const recipientSocket = this.getUserSocket(recipientId);
    if (recipientSocket) {
      recipientSocket.emit('new-chat-message', payload);
    }
  }

  @SubscribeMessage('update-chat-message')
  editChatMessage(@MessageBody() payload: EditTextMessageDto) {
    this.server.emit('update-chat-message', {
      messageId: payload.messageId,
      content: payload.content,
    });
  }

  @SubscribeMessage('delete-chat-message')
  deleteChatMessage(@MessageBody() payload: DeleteMessageDto) {
    this.server.emit('delete-chat-message', {
      messageId: payload.messageId,
    });
  }

  @SubscribeMessage('update-chat-status')
  handleStatus(@MessageBody() payload: UpdateChatStatusDto) {
    this.server.emit('update-chat-status', {
      chatId: payload.supportChatId,
      newStatus: payload.newStatus,
    });
  }

}


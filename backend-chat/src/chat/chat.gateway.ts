import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatMessage } from 'src/common/interfaces/chat-message.interface';
import { OnEvent } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { to: string; message: string },
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    this.logger.log(
      `[ChatGateway] Received 'sendMessage' from client ${client.id} for: ${data.to}`
    );
    this.logger.debug(`[ChatGateway] Message data: ${JSON.stringify(data)}`); // [cite: 91]

    try {
      await this.chatService.handleOutgoingMessage(data.to, data.message);
      this.logger.log(
        `[ChatGateway] Message successfully processed by ChatService.`
      );
    } catch (error: unknown) {
      this.logger.error(`[ChatGateway] Error sending message.`);
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
        this.logger.error(`[ChatGateway] Error: ${error.message}`, error.stack);
      } else {
        this.logger.error(
          `[ChatGateway] Unknown error type: ${JSON.stringify(error)}`
        );
        errorMessage = `An unexpected error occurred: ${String(error)}`;
      }

      client.emit('messageSendError', { success: false, error: errorMessage });
    }
  }

  @OnEvent('chat.incoming')
  handleIncomingChatMessage(message: ChatMessage) {
    this.logger.log(
      `[ChatGateway] Emitting 'incomingMessage' event for: ${message.from}`
    );
    this.server.emit('incomingMessage', message);
  }

  @OnEvent('chat.outgoing')
  handleOutgoingChatMessage(message: ChatMessage) {
    this.logger.log(
      `[ChatGateway] Emitting 'outgoingMessage' event for: ${message.to}`
    );
    this.server.emit('outgoingMessage', message);
  }
}

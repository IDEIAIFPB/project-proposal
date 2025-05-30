import { Injectable, Logger } from '@nestjs/common';
import { MetaApiService } from '../meta-api/meta-api.service';
import { WhatsappWebhookMessage } from '../common/interfaces/whatsapp-webhook-message.interface';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../common/interfaces/chat-message.interface';

@Injectable()
export class ChatService {
  private conversations: Map<string, ChatMessage[]> = new Map();

  constructor(
    private readonly metaApiService: MetaApiService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: Logger
  ) {}

  protected saveMessage(phoneNumber: string, message: ChatMessage) {
    if (!this.conversations.has(phoneNumber)) {
      this.conversations.set(phoneNumber, []);
    }
    this.conversations.get(phoneNumber)?.push(message);
    this.logger.debug(
      `Message saved in memory for ${phoneNumber}. Total: ${this.conversations.get(phoneNumber)?.length}`
    );
  }

  public clearConversations() {
    this.conversations.clear();
  }

  getChatHistory(phoneNumber: string): ChatMessage[] {
    return this.conversations.get(phoneNumber) || [];
  }

  async handleOutgoingMessage(to: string, message: string): Promise<void> {
    this.logger.log(
      `[ChatService] Sending outgoing message to ${to}: "${message}"`
    );
    try {
      await this.metaApiService.sendMessage(to, message);
      this.logger.log(
        `[ChatService] Outgoing message sent successfully to ${to}.`
      );

      const outgoingChatMessage: ChatMessage = {
        id: uuidv4(),
        from: 'APP_NUMBER',
        to: to,
        timestamp: new Date().toISOString(),
        text: message,
        type: 'outgoing',
      };

      this.saveMessage(to, outgoingChatMessage);

      this.eventEmitter.emit('chat.outgoing', outgoingChatMessage);
    } catch (error: unknown) {
      this.logger.error(
        `[ChatService] Failed to send outgoing message to ${to}. Error handled in MetaApiService.`
      );
      throw error;
    }
  }

  @OnEvent('whatsapp.incomingMessage')
  async processIncomingWhatsappEvent(
    message: WhatsappWebhookMessage
  ): Promise<void> {
    const from = message.from;
    const type = message.type;
    const currentTimestamp = new Date().toISOString();

    this.logger.log(
      `[ChatService - Event Listener] Processing 'whatsapp.incomingMessage' event. From: ${from}, Type: ${type}`
    );

    if (type === 'text' && message.text?.body) {
      const incomingChatMessage: ChatMessage = {
        id: uuidv4(),
        from: from,
        to: 'APP_NUMBER',
        timestamp: currentTimestamp,
        text: message.text.body,
        type: 'incoming',
      };
      this.saveMessage(from, incomingChatMessage);
      this.logger.log(`[ChatService] Text content: "${message.text.body}"`);

      this.eventEmitter.emit('chat.incoming', incomingChatMessage);

      const replyMessage = `You said: "${message.text.body}". I received it and I'm processing!`;
      try {
        await this.metaApiService.sendMessage(from, replyMessage);
        this.logger.log(
          `[ChatService] Response sent to <span class="math-inline">{from}: "</span>{replyMessage}"`
        );
        const outgoingChatMessage: ChatMessage = {
          id: uuidv4(),
          from: 'APP_NUMBER',
          to: from,
          timestamp: new Date().toISOString(),
          text: replyMessage,
          type: 'outgoing',
        };
        this.saveMessage(from, outgoingChatMessage);
        this.eventEmitter.emit('chat.outgoing', outgoingChatMessage);
      } catch (error: unknown) {
        this.logger.error(
          `[ChatService] Failed to send response to ${from}. Error handled in MetaApiService.`
        );
        throw error;
      }
    } else {
      const response = `I received something, but I don't understand this message type (${type}).`;
      this.logger.log(`[ChatService] Unsupported message type: ${type}`);
      try {
        await this.metaApiService.sendMessage(from, response);
        const outgoingChatMessage: ChatMessage = {
          id: uuidv4(),
          from: 'APP_NUMBER',
          to: from,
          timestamp: new Date().toISOString(),
          text: response,
          type: 'outgoing',
        };
        this.saveMessage(from, outgoingChatMessage);
        this.eventEmitter.emit('chat.outgoing', outgoingChatMessage);
      } catch (error: unknown) {
        this.logger.error(
          `[ChatService] Failed to send response for unsupported type to ${from}. Error handled in MetaApiService.`
        );
        throw error;
      }
    }
  }
}
export { ChatMessage };

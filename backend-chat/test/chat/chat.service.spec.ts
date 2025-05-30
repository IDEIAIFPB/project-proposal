// test/chat.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from '../../src/chat/chat.service';
import { MetaApiService } from '../../src/meta-api/meta-api.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger } from '@nestjs/common';
import { vi } from 'vitest';

export interface WhatsappWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: { body: string };
  type: string;
}

const mockMetaApiService = {
  sendMessage: vi.fn(),
};

const mockEventEmitter = {
  emit: vi.fn(),
};

const mockLogger = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  verbose: vi.fn(),
  setContext: vi.fn(),
};

describe('ChatService', () => {
  let service: ChatService;
  const userPhoneNumber = '+5583986870442';
  const appNumber = 'APP_NUMBER'; // As used in the service

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: MetaApiService,
          useValue: mockMetaApiService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = testingModule.get<ChatService>(ChatService);

    // Clear mocks
    mockMetaApiService.sendMessage.mockClear();
    mockEventEmitter.emit.mockClear();
    mockLogger.log.mockClear();
    mockLogger.error.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.debug.mockClear();
    mockLogger.verbose.mockClear();

    service.clearConversations();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleOutgoingMessage', () => {
    const recipientPhoneNumber = '+5583912345678';
    const messageText = 'This is an outgoing test message.';

    it('should send a message via MetaApiService, save it, and emit chat.outgoing event', async () => {
      mockMetaApiService.sendMessage.mockResolvedValue(undefined);

      await service.handleOutgoingMessage(recipientPhoneNumber, messageText);

      expect(mockMetaApiService.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockMetaApiService.sendMessage).toHaveBeenCalledWith(
        recipientPhoneNumber,
        messageText
      );

      const chatHistory = service.getChatHistory(recipientPhoneNumber);
      expect(chatHistory).toHaveLength(1);
      expect(chatHistory[0]).toEqual(
        expect.objectContaining({
          to: recipientPhoneNumber,
          from: appNumber,
          text: messageText,
          type: 'outgoing',
        })
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'chat.outgoing',
        expect.objectContaining({
          to: recipientPhoneNumber,
          from: appNumber,
          text: messageText,
          type: 'outgoing',
        })
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        `[ChatService] Sending outgoing message to ${recipientPhoneNumber}: "${messageText}"`
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        `[ChatService] Outgoing message sent successfully to ${recipientPhoneNumber}.`
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Message saved in memory for ${recipientPhoneNumber}. Total: 1`
      );
    });

    it('should handle MetaApiService error, re-throw it, and not save or emit event', async () => {
      const apiError = new Error('Failed to send outgoing');
      mockMetaApiService.sendMessage.mockRejectedValue(apiError);

      await expect(
        service.handleOutgoingMessage(recipientPhoneNumber, messageText)
      ).rejects.toThrow(apiError);

      expect(mockMetaApiService.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockMetaApiService.sendMessage).toHaveBeenCalledWith(
        recipientPhoneNumber,
        messageText
      );

      const chatHistory = service.getChatHistory(recipientPhoneNumber);
      expect(chatHistory).toHaveLength(0); // Message should not be saved

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        `[ChatService] Failed to send outgoing message to ${recipientPhoneNumber}. Error handled in MetaApiService.`
      );
    });
  });

  describe('processIncomingWhatsappEvent', () => {
    it('should process a text message, save incoming and outgoing, send reply, and emit events', async () => {
      const incomingText = 'Event test message';
      const mockEventMessage: WhatsappWebhookMessage = {
        from: userPhoneNumber,
        type: 'text',
        text: { body: incomingText },
        id: 'event-msg-id-1',
        timestamp: new Date().toISOString(),
      };
      const expectedReplyText = `You said: "${incomingText}". I received it and I'm processing!`;
      mockMetaApiService.sendMessage.mockResolvedValue(undefined);

      await service.processIncomingWhatsappEvent(mockEventMessage);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `[ChatService - Event Listener] Processing 'whatsapp.incomingMessage' event. From: ${userPhoneNumber}, Type: text`
      );
      expect(mockMetaApiService.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockMetaApiService.sendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expectedReplyText
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(2);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'chat.incoming',
        expect.objectContaining({ text: incomingText, type: 'incoming' })
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'chat.outgoing',
        expect.objectContaining({ text: expectedReplyText, type: 'outgoing' })
      );

      const chatHistory = service.getChatHistory(userPhoneNumber);
      expect(chatHistory).toHaveLength(2);
      expect(chatHistory[0].text).toBe(incomingText);
    });

    it('should handle unsupported message type, save specific reply, and emit outgoing event', async () => {
      const unsupportedType = 'audio';
      const mockEventMessage: WhatsappWebhookMessage = {
        from: userPhoneNumber,
        type: unsupportedType,
        id: 'event-msg-id-2',
        timestamp: new Date().toISOString(),
      };
      const expectedReplyText = `I received something, but I don't understand this message type (${unsupportedType}).`;
      mockMetaApiService.sendMessage.mockResolvedValue(undefined);

      await service.processIncomingWhatsappEvent(mockEventMessage);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `[ChatService - Event Listener] Processing 'whatsapp.incomingMessage' event. From: ${userPhoneNumber}, Type: ${unsupportedType}`
      );
      expect(mockMetaApiService.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockMetaApiService.sendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expectedReplyText
      );

      const chatHistory = service.getChatHistory(userPhoneNumber);
      expect(chatHistory).toHaveLength(1);
      expect(chatHistory[0]).toEqual(
        expect.objectContaining({
          text: expectedReplyText,
          type: 'outgoing',
          to: userPhoneNumber,
          from: appNumber,
        })
      );

      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'chat.outgoing',
        expect.objectContaining({
          text: expectedReplyText,
          type: 'outgoing',
          to: userPhoneNumber,
        })
      );
    });

    it('should save incoming, attempt reply, handle metaApiService error, re-throw, and log error', async () => {
      const incomingText = 'Event test error';
      const mockEventMessage: WhatsappWebhookMessage = {
        from: userPhoneNumber,
        type: 'text',
        text: { body: incomingText },
        id: 'event-msg-id-3',
        timestamp: new Date().toISOString(),
      };
      const apiError = new Error('Meta API failed on event');
      mockMetaApiService.sendMessage.mockRejectedValue(apiError);

      await expect(
        service.processIncomingWhatsappEvent(mockEventMessage)
      ).rejects.toThrow(apiError);

      expect(mockLogger.log).toHaveBeenCalledWith(
        `[ChatService - Event Listener] Processing 'whatsapp.incomingMessage' event. From: ${userPhoneNumber}, Type: text`
      );
      expect(mockMetaApiService.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1); // Only chat.incoming
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'chat.incoming',
        expect.objectContaining({ text: incomingText, type: 'incoming' })
      );

      const chatHistory = service.getChatHistory(userPhoneNumber);
      expect(chatHistory).toHaveLength(1); // Only incoming saved
      expect(chatHistory[0].text).toBe(incomingText);
      expect(mockLogger.error).toHaveBeenCalledWith(
        `[ChatService] Failed to send response to ${userPhoneNumber}. Error handled in MetaApiService.`
      );
    });

    it('should log error and re-throw if sending "unsupported type" response fails in event handler (lines 208-212)', async () => {
      const unsupportedType = 'location';
      const mockEventMessage: WhatsappWebhookMessage = {
        from: userPhoneNumber,
        type: unsupportedType,
        id: 'event-msg-id-unsupported-fail',
        timestamp: new Date().toISOString(),
        // Adicione outros campos da interface WhatsappWebhookMessage se necessário
      };
      const expectedReplyText = `I received something, but I don't understand this message type (${unsupportedType}).`;
      const apiError = new Error(
        'Meta API failed to send for event unsupported type'
      );
      mockMetaApiService.sendMessage.mockRejectedValue(apiError);

      await expect(
        service.processIncomingWhatsappEvent(mockEventMessage)
      ).rejects.toThrow(apiError);

      expect(mockMetaApiService.sendMessage).toHaveBeenCalledTimes(1);
      expect(mockMetaApiService.sendMessage).toHaveBeenCalledWith(
        userPhoneNumber,
        expectedReplyText
      );
      expect(mockLogger.error).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledWith(
        `[ChatService] Failed to send response for unsupported type to ${userPhoneNumber}. Error handled in MetaApiService.`
      );
      // Nenhuma mensagem de saída deve ser emitida ou salva se o envio da resposta falhar
      expect(mockEventEmitter.emit).not.toHaveBeenCalledWith(
        'chat.outgoing',
        expect.anything()
      );
      const chatHistory = service.getChatHistory(userPhoneNumber);
      expect(chatHistory).toHaveLength(0);
    });
  });
});

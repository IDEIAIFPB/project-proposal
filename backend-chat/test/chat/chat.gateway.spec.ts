// test/chat.gateway.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from '../../src/chat/chat.gateway';
import { ChatService } from '../../src/chat/chat.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { vi } from 'vitest';

// Definição da interface ChatMessage
export interface ChatMessage {
  id: string;
  from: string;
  to: string;
  timestamp: string;
  text: string;
  type: 'incoming' | 'outgoing';
}

// Mocks
const mockChatService = {
  handleOutgoingMessage: vi.fn(),
};

// Mock para o servidor Socket.IO
const mockIoServer = {
  emit: vi.fn(),
};

// Mock para um cliente Socket.IO
const mockClientSocket = {
  id: 'mock-client-id-123',
  emit: vi.fn(),
};

// Spies para Logger.prototype
let loggerSpyLog: ReturnType<typeof vi.spyOn>;
let loggerSpyError: ReturnType<typeof vi.spyOn>;
let loggerSpyDebug: ReturnType<typeof vi.spyOn>;

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  beforeAll(() => {
    loggerSpyLog = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {
      /* Noop */
    });
    loggerSpyError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {
        /* Noop */
      });
    loggerSpyDebug = vi
      .spyOn(Logger.prototype, 'debug')
      .mockImplementation(() => {
        /* Noop */
      });
  });

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        { provide: ChatService, useValue: mockChatService },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    // Atribuir o mock do servidor Socket.IO à instância do gateway
    // O NestJS normalmente injeta isso via @WebSocketServer(), mas em testes unitários precisamos mockar.
    gateway.server = mockIoServer as any as Server;
  });

  afterAll(() => {
    loggerSpyLog.mockRestore();
    loggerSpyError.mockRestore();
    loggerSpyDebug.mockRestore();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('Lifecycle Hooks', () => {
    it('handleConnection should log client connection', () => {
      gateway.handleConnection(mockClientSocket as any as Socket);
      expect(loggerSpyLog).toHaveBeenCalledWith(
        `Client connected: ${mockClientSocket.id}`
      );
    });

    it('handleDisconnect should log client disconnection', () => {
      gateway.handleDisconnect(mockClientSocket as any as Socket);
      expect(loggerSpyLog).toHaveBeenCalledWith(
        `Client disconnected: ${mockClientSocket.id}`
      );
    });
  });

  describe('@SubscribeMessage("sendMessage")', () => {
    const messageData = { to: 'recipient-phone', message: 'Hello there!' };

    it('should call ChatService.handleOutgoingMessage and log success', async () => {
      mockChatService.handleOutgoingMessage.mockResolvedValue(undefined);

      await gateway.handleSendMessage(
        messageData,
        mockClientSocket as any as Socket
      );

      expect(loggerSpyLog).toHaveBeenCalledWith(
        `[ChatGateway] Received 'sendMessage' from client ${mockClientSocket.id} for: ${messageData.to}`
      );
      expect(loggerSpyDebug).toHaveBeenCalledWith(
        `[ChatGateway] Message data: ${JSON.stringify(messageData)}`
      );
      expect(mockChatService.handleOutgoingMessage).toHaveBeenCalledWith(
        messageData.to,
        messageData.message
      );
      expect(loggerSpyLog).toHaveBeenCalledWith(
        `[ChatGateway] Message successfully processed by ChatService.`
      );
      expect(mockClientSocket.emit).not.toHaveBeenCalled(); // Não deve emitir erro para o cliente
    });

    it('should handle Error instance from ChatService and emit "messageSendError" to client', async () => {
      const serviceErrorMessage = 'Service failed to send';
      const serviceError = new Error(serviceErrorMessage);
      mockChatService.handleOutgoingMessage.mockRejectedValue(serviceError);

      await gateway.handleSendMessage(
        messageData,
        mockClientSocket as any as Socket
      );

      expect(mockChatService.handleOutgoingMessage).toHaveBeenCalledWith(
        messageData.to,
        messageData.message
      );
      expect(loggerSpyError).toHaveBeenCalledWith(
        `[ChatGateway] Error sending message.`
      );
      expect(loggerSpyError).toHaveBeenCalledWith(
        `[ChatGateway] Error: ${serviceErrorMessage}`,
        serviceError.stack
      );
      expect(mockClientSocket.emit).toHaveBeenCalledWith('messageSendError', {
        success: false,
        error: serviceErrorMessage,
      });
    });

    it('should handle unknown error from ChatService and emit "messageSendError" to client', async () => {
      const unknownErrorObject = { customError: 'Some unknown issue' };
      mockChatService.handleOutgoingMessage.mockRejectedValue(
        unknownErrorObject
      );
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      const expectedClientErrorMessage = `An unexpected error occurred: ${String(unknownErrorObject)}`;

      await gateway.handleSendMessage(
        messageData,
        mockClientSocket as any as Socket
      );

      expect(mockChatService.handleOutgoingMessage).toHaveBeenCalledWith(
        messageData.to,
        messageData.message
      );
      expect(loggerSpyError).toHaveBeenCalledWith(
        `[ChatGateway] Error sending message.`
      );
      expect(loggerSpyError).toHaveBeenCalledWith(
        `[ChatGateway] Unknown error type: ${JSON.stringify(unknownErrorObject)}`
      );
      expect(mockClientSocket.emit).toHaveBeenCalledWith('messageSendError', {
        success: false,
        error: expectedClientErrorMessage,
      });
    });
  });

  describe('@OnEvent Handlers', () => {
    const mockChatMessage: ChatMessage = {
      id: 'msg-1',
      from: 'sender-phone',
      to: 'receiver-phone',
      timestamp: new Date().toISOString(),
      text: 'This is a test message',
      type: 'incoming', // O tipo será ajustado por teste se necessário
    };

    it('handleIncomingChatMessage should emit "incomingMessage" to all clients via server', () => {
      const incomingMessage = { ...mockChatMessage, type: 'incoming' as const };
      gateway.handleIncomingChatMessage(incomingMessage);

      expect(loggerSpyLog).toHaveBeenCalledWith(
        `[ChatGateway] Emitting 'incomingMessage' event for: ${incomingMessage.from}`
      );
      expect(mockIoServer.emit).toHaveBeenCalledWith(
        'incomingMessage',
        incomingMessage
      );
    });

    it('handleOutgoingChatMessage should emit "outgoingMessage" to all clients via server', () => {
      const outgoingMessage = {
        ...mockChatMessage,
        type: 'outgoing' as const,
        from: 'APP_NUMBER',
        to: 'client-phone',
      };
      gateway.handleOutgoingChatMessage(outgoingMessage);

      expect(loggerSpyLog).toHaveBeenCalledWith(
        `[ChatGateway] Emitting 'outgoingMessage' event for: ${outgoingMessage.to}`
      );
      expect(mockIoServer.emit).toHaveBeenCalledWith(
        'outgoingMessage',
        outgoingMessage
      );
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MetaApiController } from '../../src/meta-api/meta-api.controller';
import { MetaApiService } from '../../src/meta-api/meta-api.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Logger, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { vi } from 'vitest';
import {
  WhatsappWebhookMessage,
  WhatsappWebhookPayload,
} from 'src/common/interfaces/whatsapp-webhook-message.interface';

// Mocks para os serviços
const mockMetaApiService = {
  getWebhookVerifyToken: vi.fn(),
};

const mockEventEmitter = {
  emit: vi.fn(),
};

// Mock para o objeto Response do Express
const mockResponseObject = {
  status: vi.fn().mockReturnThis(),
  send: vi.fn().mockReturnThis(),
  sendStatus: vi.fn().mockReturnThis(),
};

// Spies para Logger.prototype
let loggerSpyLog: ReturnType<typeof vi.spyOn>;
let loggerSpyError: ReturnType<typeof vi.spyOn>;

describe('MetaApiController', () => {
  let controller: MetaApiController;

  beforeAll(() => {
    loggerSpyLog = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {
      /* Noop */
    });
    loggerSpyError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {
        /* Noop */
      });
  });

  beforeEach(async () => {
    vi.clearAllMocks(); // Limpa todos os mocks e spies do Vitest

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MetaApiController],
      providers: [
        { provide: MetaApiService, useValue: mockMetaApiService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    controller = module.get<MetaApiController>(MetaApiController);
  });

  afterAll(() => {
    loggerSpyLog.mockRestore();
    loggerSpyError.mockRestore();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('verifyWebhook (GET /webhook)', () => {
    const mockChallenge = 'hub_challenge_string';
    const mockServiceToken = 'my_secret_verify_token';

    beforeEach(() => {
      mockMetaApiService.getWebhookVerifyToken.mockReturnValue(
        mockServiceToken
      );
    });

    it('should respond with 200 and challenge if mode is "subscribe" and token matches', () => {
      controller.verifyWebhook(
        'subscribe',
        mockServiceToken,
        mockChallenge,
        mockResponseObject as any as Response
      );

      expect(mockMetaApiService.getWebhookVerifyToken).toHaveBeenCalledTimes(1);
      expect(mockResponseObject.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponseObject.send).toHaveBeenCalledWith(mockChallenge);
      expect(loggerSpyLog).toHaveBeenCalledWith(
        '[MetaApiController - GET] success connecting meta api'
      );
    });

    it('should respond with 403 if mode is not "subscribe"', () => {
      controller.verifyWebhook(
        'unsubscribe', // Modo incorreto
        mockServiceToken,
        mockChallenge,
        mockResponseObject as any as Response
      );

      expect(mockMetaApiService.getWebhookVerifyToken).toHaveBeenCalledTimes(1);
      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(
        HttpStatus.FORBIDDEN
      );
      expect(loggerSpyLog).toHaveBeenCalledWith(
        '[MetaApiController - GET] error connecting meta api'
      );
    });

    it('should respond with 403 if token does not match', () => {
      controller.verifyWebhook(
        'subscribe',
        'wrong_token', // Token incorreto
        mockChallenge,
        mockResponseObject as any as Response
      );
      expect(mockMetaApiService.getWebhookVerifyToken).toHaveBeenCalledTimes(1);
      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(
        HttpStatus.FORBIDDEN
      );
      expect(loggerSpyLog).toHaveBeenCalledWith(
        '[MetaApiController - GET] error connecting meta api'
      );
    });

    it('should respond with 403 if both mode and token are incorrect', () => {
      controller.verifyWebhook(
        'unsubscribe',
        'wrong_token',
        mockChallenge,
        mockResponseObject as any as Response
      );
      expect(mockMetaApiService.getWebhookVerifyToken).toHaveBeenCalledTimes(1);
      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(
        HttpStatus.FORBIDDEN
      );
    });
  });

  describe('handleWebhook (POST /webhook)', () => {
    const mockBaseMessage: Omit<WhatsappWebhookMessage, 'text' | 'type'> = {
      from: '1234567890',
      id: 'wamid.HBgLMTYwODU1Njc0MDkQA Nachrichten',
      timestamp: String(Date.now() / 1000),
    };

    const createMockPayload = (
      messages: Partial<WhatsappWebhookMessage>[]
    ): WhatsappWebhookPayload => ({
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'entry_id_1',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '16505551111',
                  phone_number_id: '123456123456123',
                },
                messages: messages.map((msg) => ({
                  ...mockBaseMessage,
                  ...msg,
                })) as WhatsappWebhookMessage[],
              },
            },
          ],
        },
      ],
    });

    it('should respond with 200 OK immediately', () => {
      const payload = createMockPayload([]); // Payload vazio, mas ainda válido
      controller.handleWebhook(payload, mockResponseObject as any as Response);
      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(loggerSpyLog).toHaveBeenCalledWith(
        '[MetaApiController - POST] POST Webhook received.'
      );
    });

    it('should emit "whatsapp.incomingMessage" for a valid text message', () => {
      const messageText = 'Hello from webhook!';
      const textMessage: Partial<WhatsappWebhookMessage> = {
        type: 'text',
        text: { body: messageText },
      };
      const payload = createMockPayload([textMessage]);
      const expectedMessage = { ...mockBaseMessage, ...textMessage };

      controller.handleWebhook(payload, mockResponseObject as any as Response);

      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'whatsapp.incomingMessage',
        expectedMessage
      );
      expect(loggerSpyLog).toHaveBeenCalledWith(
        expect.stringContaining(`Content: "${messageText}"`)
      );
    });

    it('should emit for multiple text messages in the payload', () => {
      const textMessage1: Partial<WhatsappWebhookMessage> = {
        type: 'text',
        text: { body: 'First' },
        id: 'msg1',
      };
      const textMessage2: Partial<WhatsappWebhookMessage> = {
        type: 'text',
        text: { body: 'Second' },
        id: 'msg2',
      };
      const payload = createMockPayload([textMessage1, textMessage2]);

      controller.handleWebhook(payload, mockResponseObject as any as Response);

      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(2);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'whatsapp.incomingMessage',
        expect.objectContaining({ id: 'msg1' })
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'whatsapp.incomingMessage',
        expect.objectContaining({ id: 'msg2' })
      );
    });

    it('should NOT emit for non-text messages', () => {
      const imageMessage: Partial<WhatsappWebhookMessage> = { type: 'image' }; // Sem corpo de texto
      const payload = createMockPayload([imageMessage]);

      controller.handleWebhook(payload, mockResponseObject as any as Response);

      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(loggerSpyLog).toHaveBeenCalledWith(
        '[MetaApiController - POST] Non-text message received.'
      );
    });

    it('should handle mixed text and non-text messages correctly', () => {
      const textMessage: Partial<WhatsappWebhookMessage> = {
        type: 'text',
        text: { body: 'Hello' },
        id: 'txt1',
      };
      const imageMessage: Partial<WhatsappWebhookMessage> = {
        type: 'image',
        id: 'img1',
      };
      const payload = createMockPayload([textMessage, imageMessage]);
      const expectedTextMessage = { ...mockBaseMessage, ...textMessage };

      controller.handleWebhook(payload, mockResponseObject as any as Response);

      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockEventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'whatsapp.incomingMessage',
        expectedTextMessage
      );
      expect(loggerSpyLog).toHaveBeenCalledWith(
        '[MetaApiController - POST] Non-text message received.'
      );
    });

    it('should not emit if payload.object is not "whatsapp_business_account"', () => {
      const payload = createMockPayload([
        { type: 'text', text: { body: 'test' } },
      ]);
      payload.object = 'instagram_account'; // Objeto incorreto

      controller.handleWebhook(payload, mockResponseObject as any as Response);

      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should not emit if change.field is not "messages"', () => {
      const payload = createMockPayload([
        { type: 'text', text: { body: 'test' } },
      ]);
      payload.entry[0].changes[0].field = 'other_field'; // Campo incorreto

      controller.handleWebhook(payload, mockResponseObject as any as Response);

      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should not emit if change.value.messages is missing or not an array', () => {
      const payload = createMockPayload([]); // Começa com um payload válido onde messages é []

      // Caso 1: messages está ausente (delete)
      // @ts-ignore: Acessando para deletar uma propriedade opcional, o que é válido para o teste.
      // Ou, se 'value' em si puder ser undefined, você pode precisar construir o payload de forma diferente.
      // Assumindo que payload.entry[0].changes[0].value sempre existe neste ponto do payload.
      const initialValue = payload.entry[0].changes[0].value;
      const valueWithoutMessages = { ...initialValue };
      delete valueWithoutMessages.messages; // Remove a propriedade messages
      payload.entry[0].changes[0].value = valueWithoutMessages;


      controller.handleWebhook(payload, mockResponseObject as any as Response);
      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(loggerSpyLog).toHaveBeenCalledWith(
        '[MetaApiController - POST] Message not found on this webhook event.'
      );

      vi.clearAllMocks(); // Limpar para o próximo caso

      // Restaurar a estrutura básica para o próximo sub-teste
      payload.entry[0].changes[0].value = { ...initialValue, messages: [] }; // Restaura com messages como array vazio
      // antes de atribuir o objeto.

      // Caso 2: messages existe, mas não é um array (é um objeto vazio)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload.entry[0].changes[0].value.messages = {} as any; // Atribuição intencionalmente "unsafe" para testar Array.isArray()

      controller.handleWebhook(payload, mockResponseObject as any as Response);
      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(HttpStatus.OK); // Verifica se foi chamado de novo ou use toHaveBeenCalledTimes(2)
      expect(mockEventEmitter.emit).not.toHaveBeenCalled(); // Continua não tendo sido chamado
      expect(loggerSpyLog).toHaveBeenCalledWith( // Verifica se foi chamado de novo ou use toHaveBeenCalledTimes(2)
        '[MetaApiController - POST] Message not found on this webhook event.'
      );
    });

    it('should log error if eventEmitter.emit throws an Error', () => {
      const errorMessage = 'Emitter failed';
      const textMessage: Partial<WhatsappWebhookMessage> = {
        type: 'text',
        text: { body: 'trigger error' },
      };
      const payload = createMockPayload([textMessage]);
      mockEventEmitter.emit.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      controller.handleWebhook(payload, mockResponseObject as any as Response);

      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(loggerSpyError).toHaveBeenCalledWith(
        `[MetaApiController - POST] Error processing webhook: ${errorMessage}`,
        expect.any(String) // Para o stack trace
      );
    });

    it('should log error if eventEmitter.emit throws an unknown error', () => {
      const unknownErrorObject = { detail: 'Unknown emitter issue' }; // Objeto simples

      const textMessage: Partial<WhatsappWebhookMessage> = {
        type: 'text',
        text: { body: 'trigger unknown error' },
      };
      const payload = createMockPayload([textMessage]);
      mockEventEmitter.emit.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw unknownErrorObject; // Lançando intencionalmente um não-Error para testar o 'else' do catch
      });

      controller.handleWebhook(payload, mockResponseObject as any as Response);

      expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(HttpStatus.OK);
      expect(loggerSpyError).toHaveBeenCalledWith(
        `[MetaApiController - POST] Unknow error processing webhook. Details: ${JSON.stringify(unknownErrorObject)}`
      );
    });
  });
});

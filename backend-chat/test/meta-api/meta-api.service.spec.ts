// test/meta-api.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AxiosError, AxiosHeaders } from 'axios';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { MetaApiService } from '../../src/meta-api/meta-api.service';

// Simplified interfaces for testing purposes
export interface MetaApiResponse {
  messaging_product: string;
  contacts: { input: string; wa_id: string }[];
  messages: { id: string }[];
}

export interface MetaApiError {
  message: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

export interface MetaApiErrorResponseData {
  error: MetaApiError;
}

// Mocks
const mockConfigService = {
  get: vi.fn(),
};

const mockHttpService = {
  post: vi.fn(),
};

// Spies for Logger.prototype methods
let loggerSpyLog: ReturnType<typeof vi.spyOn>;
let loggerSpyError: ReturnType<typeof vi.spyOn>;
let loggerSpyDebug: ReturnType<typeof vi.spyOn>;

describe('MetaApiService', () => {
  let service: MetaApiService;

  const mockMetaApiUrl = 'http://localhost:3000/v1/';
  const mockPhoneNumberId = '1234567890';
  const mockAccessToken = 'TEST_ACCESS_TOKEN';
  const mockWebhookVerifyToken = 'TEST_WEBHOOK_TOKEN';

  beforeAll(() => {
    // Spy on Logger methods BEFORE any service instantiation that might use them
    loggerSpyLog = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {
      /* do nothing */
    });
    loggerSpyError = vi
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {
        /* do nothing */
      });
    loggerSpyDebug = vi
      .spyOn(Logger.prototype, 'debug')
      .mockImplementation(() => {
        /* do nothing */
      });
  });

  beforeEach(async () => {
    vi.clearAllMocks(); // Clears all vi mocks and spies

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetaApiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<MetaApiService>(MetaApiService);

    // Reset default mock implementations for ConfigService for each test
    // to avoid interference between onModuleInit tests and sendMessage tests.
    mockConfigService.get.mockImplementation((key: string) => {
      switch (key) {
        case 'META_API_URL':
          return mockMetaApiUrl;
        case 'META_API_PHONE_NUMBER_ID':
          return mockPhoneNumberId;
        case 'META_API_ACCESS_TOKEN':
          return mockAccessToken;
        case 'META_WEBHOOK_VERIFY_TOKEN':
          return mockWebhookVerifyToken;
        default:
          return undefined;
      }
    });
  });

  afterAll(() => {
    // Restore original Logger methods
    loggerSpyLog.mockRestore();
    loggerSpyError.mockRestore();
    loggerSpyDebug.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should initialize successfully when all config variables are present', () => {
      expect(() => service.onModuleInit()).not.toThrow();
      expect(mockConfigService.get).toHaveBeenCalledWith('META_API_URL');
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'META_API_PHONE_NUMBER_ID'
      );
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'META_API_ACCESS_TOKEN'
      );
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'META_WEBHOOK_VERIFY_TOKEN'
      );
      expect(loggerSpyLog).toHaveBeenCalledWith(
        'Meta API Service initialized successfully with configurations.'
      );
      expect(loggerSpyDebug).toHaveBeenCalledWith(
        `Webhook Verify Token: ${mockWebhookVerifyToken}`
      );
      expect(service.webhookVerifyToken).toBe(mockWebhookVerifyToken);
    });

    const requiredVars = [
      'META_API_URL',
      'META_API_PHONE_NUMBER_ID',
      'META_API_ACCESS_TOKEN',
      'META_WEBHOOK_VERIFY_TOKEN',
    ];

    requiredVars.forEach((missingVar) => {
      it(`should throw an error if ${missingVar} is missing`, () => {
        mockConfigService.get.mockImplementation((key: string) => {
          if (key === missingVar) return undefined;
          return `mock_value_for_${key}`;
        });
        expect(() => service.onModuleInit()).toThrow(
          `[Config Error] Missing required environment variables: ${missingVar}`
        );
      });
    });

    it('should throw an error listing all missing variables if multiple are missing', () => {
      const missingSubset = [requiredVars[0], requiredVars[2]];
      mockConfigService.get.mockImplementation((key: string) => {
        if (missingSubset.includes(key)) return undefined;
        return `mock_value_for_${key}`;
      });
      expect(() => service.onModuleInit()).toThrow(
        `[Config Error] Missing required environment variables: ${missingSubset.join(', ')}`
      );
    });
  });

  describe('sendMessage', () => {
    const recipient = '+15551234567';
    const message = 'Hello World';
    const expectedUrl = `${mockMetaApiUrl}${mockPhoneNumberId}/messages`;

    // Helper to create AxiosError instances
    const createAxiosError = <TResponseData = any>(
      responseData: TResponseData,
      status: number,
      message = 'Request failed',
      code?: string
    ) => {
      return new AxiosError(
        message,
        code,
        { headers: new AxiosHeaders() }, // config
        null, // request
        {
          // response
          data: responseData,
          status,
          statusText: 'Error',
          headers: {},
          config: { headers: new AxiosHeaders() },
        }
      );
    };

    beforeEach(() => {
      // Ensure service is "initialized" for sendMessage tests
      service.onModuleInit();
      // Clear mocks again after onModuleInit might have called them
      loggerSpyLog.mockClear();
      loggerSpyError.mockClear();
      loggerSpyDebug.mockClear();
    });

    it('should send a message successfully', async () => {
      const mockApiResponse: MetaApiResponse = {
        messaging_product: 'whatsapp',
        contacts: [{ input: recipient, wa_id: recipient.substring(1) }],
        messages: [{ id: 'wamid.mock_id' }],
      };
      const mockAxiosResponse = {
        data: mockApiResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      mockHttpService.post.mockReturnValue(of(mockAxiosResponse));

      const response = await service.sendMessage(recipient, message);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        expectedUrl,
        {
          messaging_product: 'whatsapp',
          to: recipient,
          type: 'text',
          text: { body: message },
        },
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      expect(response).toEqual(mockAxiosResponse);
      expect(loggerSpyLog).toHaveBeenCalledWith(
        `[MetaApiService] Sending message to ${recipient}.`
      );
      expect(loggerSpyLog).toHaveBeenCalledWith(
        `[MetaApiService] Message sent successfully. Status: ${mockAxiosResponse.status}`
      );
      expect(loggerSpyDebug).toHaveBeenCalledWith(
        `API Response: ${JSON.stringify(mockApiResponse)}`
      );
    });

    it('should format phone number by adding + if missing', async () => {
      const rawNumber = '5583912345678';
      const formattedNumber = `+${rawNumber}`;
      mockHttpService.post.mockReturnValue(of({ status: 200, data: {} }));
      await service.sendMessage(rawNumber, message);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ to: formattedNumber }),
        expect.any(Object)
      );
    });

    it('should format Brazilian +5583 number by adding 9 if missing and length is 13', async () => {
      const rawNumber = '+558312345678';
      const formattedNumber = '+5583912345678';
      mockHttpService.post.mockReturnValue(of({ status: 200, data: {} }));
      await service.sendMessage(rawNumber, message);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ to: formattedNumber }),
        expect.any(Object)
      );
      expect(loggerSpyDebug).toHaveBeenCalledWith(
        `[MetaApiService] Formatted Brazilian number: ${formattedNumber}`
      );
    });

    it('should NOT format Brazilian +5583 number if 9 is already present', async () => {
      const correctNumber = '+5583912345678';
      mockHttpService.post.mockReturnValue(of({ status: 200, data: {} }));
      await service.sendMessage(correctNumber, message);
      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ to: correctNumber }),
        expect.any(Object)
      );
      expect(loggerSpyDebug).not.toHaveBeenCalledWith(
        expect.stringContaining('Formatted Brazilian number')
      );
    });

    it('should correctly format or not format +5583 numbers based on their pattern', async () => {
      const oldMobilePatternNumber = '+558332345678';
      const expectedFormattedOldMobile = '+5583932345678';

      mockHttpService.post.mockReturnValue(of({ status: 200, data: {} }));
      await service.sendMessage(oldMobilePatternNumber, message);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ to: expectedFormattedOldMobile }),
        expect.any(Object)
      );
      expect(loggerSpyDebug).toHaveBeenCalledWith(
        `[MetaApiService] Formatted Brazilian number: ${expectedFormattedOldMobile}`
      );

      mockHttpService.post.mockClear();
      loggerSpyDebug.mockClear();

      // Caso 2: Número +5583 já com '9' e formato correto (14 caracteres)
      // Não deve ser formatado.
      const alreadyCorrectMobile = '+5583912345678'; // Comprimento 14

      mockHttpService.post.mockReturnValue(of({ status: 200, data: {} })); // Re-mockar o retorno se necessário
      await service.sendMessage(alreadyCorrectMobile, message);

      expect(mockHttpService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ to: alreadyCorrectMobile }), // ESPERA SEM FORMATAÇÃO
        expect.any(Object)
      );
      expect(loggerSpyDebug).not.toHaveBeenCalledWith(
        expect.stringContaining('Formatted Brazilian number:')
      );
    });

    it('should throw HttpException on AxiosError with response data', async () => {
      const errorData: MetaApiErrorResponseData = {
        error: {
          message: 'Meta specific error message',
          code: 190,
          type: 'OAuthException',
        },
      };
      const status = 400;
      const axiosError = createAxiosError(errorData, status, 'Meta API Error');
      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.sendMessage(recipient, message)).rejects.toThrow(
        HttpException
      );
      try {
        await service.sendMessage(recipient, message);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        const httpEx = e as HttpException;
        expect(httpEx.getStatus()).toBe(status);
        expect(httpEx.getResponse()).toEqual({
          message: `Failed to send message via WhatsApp API: ${errorData.error.message}`,
          statusCode: status,
          externalApiDetails: errorData,
        });
        expect(loggerSpyError).toHaveBeenCalledWith(
          `[MetaApiService] Axios Error: ${axiosError.message}`,
          axiosError.stack
        );
        expect(loggerSpyError).toHaveBeenCalledWith(
          `[MetaApiService] Error Data from Meta API: ${JSON.stringify(errorData)} for recipient: ${recipient}`
        );
      }
    });

    it('should throw HttpException on AxiosError without response (network error)', async () => {
      const axiosError = new AxiosError('Network Error', 'ERR_NETWORK');
      // Ensure error.response is undefined
      delete axiosError.response;
      mockHttpService.post.mockReturnValue(throwError(() => axiosError));

      await expect(service.sendMessage(recipient, message)).rejects.toThrow(
        HttpException
      );
      try {
        await service.sendMessage(recipient, message);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        const httpEx = e as HttpException;
        expect(httpEx.getStatus()).toBe(HttpStatus.BAD_GATEWAY); // Default status
        expect(httpEx.getResponse()).toEqual({
          message: `Failed to send message via WhatsApp API: Network Error`,
          statusCode: HttpStatus.BAD_GATEWAY,
          externalApiDetails: undefined,
        });
        expect(loggerSpyError).toHaveBeenCalledWith(
          `[MetaApiService] Axios Error: ${axiosError.message}`,
          axiosError.stack
        );
      }
    });

    it('should throw HttpException on generic Error from HttpService', async () => {
      const genericError = new Error('Some other internal error');
      mockHttpService.post.mockReturnValue(throwError(() => genericError));

      await expect(service.sendMessage(recipient, message)).rejects.toThrow(
        HttpException
      );
      try {
        await service.sendMessage(recipient, message);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        const httpEx = e as HttpException;
        expect(httpEx.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(httpEx.getResponse()).toEqual({
          message: `Internal error in Meta API service: ${genericError.message}`,
        });
        expect(loggerSpyError).toHaveBeenCalledWith(
          `[MetaApiService] Unexpected Error: ${genericError.message}`,
          genericError.stack
        );
      }
    });

    it('should throw HttpException on unknown error type from HttpService', async () => {
      const unknownError = { weirdError: 'Unknown structure' }; // Not an Error instance
      mockHttpService.post.mockReturnValue(throwError(() => unknownError));

      await expect(service.sendMessage(recipient, message)).rejects.toThrow(
        HttpException
      );
      try {
        await service.sendMessage(recipient, message);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        const httpEx = e as HttpException;
        expect(httpEx.getStatus()).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(httpEx.getResponse()).toEqual({
          message: 'Unknown error communicating with WhatsApp API.',
        });
        expect(loggerSpyError).toHaveBeenCalledWith(
          '[MetaApiService] Unknown error while sending message.'
        );
      }
    });
  });

  describe('getWebhookVerifyToken', () => {
    it('should return the webhookVerifyToken set during onModuleInit', () => {
      service.onModuleInit(); // Ensure it's initialized
      expect(service.getWebhookVerifyToken()).toBe(mockWebhookVerifyToken);
    });
  });
});

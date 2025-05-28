import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WhatsAppBadResponseException } from 'src/common/exceptions/whatsapp-bad-response.exception';
import { WhatsAppTokenExpiredException } from 'src/common/exceptions/whatsapp-token-expired.exception';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { SendMessageDto } from './dto/send-message.dto';
import { WhatsAppApiResponse } from './interfaces/whatsapp-api-response.interface';

interface AxiosErrorResponseData {
  error?: {
    message?: string;
    code?: number;
    error_subcode?: number;
  };
}

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);
  private readonly whatsappApiUrl: string;
  private readonly whatsappToken: string;
  private readonly phoneId: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const baseUrl = this.configService.get<string>('WHATSAPP_API_URL') || '';
    const phoneId = this.configService.get<string>('WHATSAPP_PHONE_ID') || '';
    this.whatsappToken = this.configService.get<string>('WHATSAPP_TOKEN') || '';

    if (!baseUrl || !phoneId || !this.whatsappToken) {
      this.logger.error(
        'WHATSAPP_API_URL, WHATSAPP_PHONE_ID ou WHATSAPP_TOKEN ausentes no .env',
      );
      throw new InternalServerErrorException(
        'Configuração da API do WhatsApp está incompleta.',
      );
    }

    this.phoneId = phoneId;
    this.whatsappApiUrl = `${baseUrl}/${phoneId}/messages`;
  }

  sendMessage(
    sendMessageDto: SendMessageDto,
  ): Observable<ApiResponse<{ messageId: string }>> {
    const payload = this.createPayload(sendMessageDto);

    return this.httpService
      .post<WhatsAppApiResponse>(this.whatsappApiUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.whatsappToken}`,
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        map((response) => {
          const result = this.handleResponse(response.data);
          return {
            success: true,
            data: result,
            message: 'Mensagem enviada com sucesso.',
          };
        }),
        catchError((error) => {
          try {
            this.handleError(error);
          } catch (e) {
            const fallbackError =
              e instanceof HttpException
                ? e
                : new InternalServerErrorException(
                  'Erro desconhecido ao enviar mensagem.',
                );
            return throwError(() => fallbackError);
          }
        }),
      );
  }

  private createPayload(dto: SendMessageDto) {
    return {
      messaging_product: 'whatsapp',
      to: dto.to,
      type: 'text',
      text: {
        body: dto.message,
      },
    };
  }

  private handleResponse(responseData: WhatsAppApiResponse): {
    messageId: string;
  } {
    if (responseData.error) {
      const error = responseData.error;
      this.logger.error(`WhatsApp API Error: ${JSON.stringify(error)}`);

      if (error.code === 190 && error.error_subcode === 463) {
        throw new WhatsAppTokenExpiredException();
      }

      throw new BadRequestException(
        `Erro da API do WhatsApp: ${error.message} (Code: ${error.code}, Subcode: ${error.error_subcode || 'N/A'})`,
      );
    }

    const messageId = responseData.messages?.[0]?.id;
    if (!messageId) {
      this.logger.error(
        `Unexpected WhatsApp API response: ${JSON.stringify(responseData)}`,
      );
      throw new WhatsAppBadResponseException();
    }

    return { messageId };
  }

  private handleError(error: unknown): never {
    if (error instanceof HttpException) throw error;

    if (error instanceof AxiosError) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const data = error.response?.data as AxiosErrorResponseData;
      const message = data?.error?.message ?? error.message;

      this.logger.error(`AxiosError: ${message}`, error, error.stack);

      if (error.response?.data) {
        this.logger.error(
          `AxiosError response data: ${JSON.stringify(error.response.data)}`,
        );
      }

      if ([HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN].includes(status)) {
        throw new UnauthorizedException(`Autenticação: ${message}`);
      }

      throw new HttpException(
        `Erro na comunicação com a API do WhatsApp: ${message}`,
        status,
      );
    }

    const unknownError = error as Error;
    this.logger.error(
      `Unknown error: ${unknownError.message}`,
      unknownError.stack,
    );

    throw new InternalServerErrorException(
      'Erro interno ao tentar enviar mensagem.',
    );
  }
}

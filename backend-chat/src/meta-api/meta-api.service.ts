import {
  Injectable,
  Logger,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { MetaApiResponse } from './meta-api-response.interface';
import { MetaApiErrorResponseData } from '../common/interfaces/meta-api-error-response.interface';

@Injectable()
export class MetaApiService implements OnModuleInit {
  private readonly logger = new Logger(MetaApiService.name);
  private metaApiUrl: string | undefined;
  private phoneNumberId: string | undefined;
  private accessToken: string | undefined;
  public webhookVerifyToken: string | undefined;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  onModuleInit() {
    const metaApiUrl = this.configService.get<string>('META_API_URL');
    const phoneNumberId = this.configService.get<string>(
      'META_API_PHONE_NUMBER_ID'
    );
    const accessToken = this.configService.get<string>('META_API_ACCESS_TOKEN');
    const webhookVerifyToken = this.configService.get<string>(
      'META_WEBHOOK_VERIFY_TOKEN'
    );

    const missing: string[] = [];
    if (!metaApiUrl) missing.push('META_API_URL');
    if (!phoneNumberId) missing.push('META_API_PHONE_NUMBER_ID');
    if (!accessToken) missing.push('META_API_ACCESS_TOKEN');
    if (!webhookVerifyToken) missing.push('META_WEBHOOK_VERIFY_TOKEN');

    if (missing.length > 0) {
      throw new Error(
        `[Config Error] Missing required environment variables: ${missing.join(', ')}`
      );
    }

    this.metaApiUrl = metaApiUrl;
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
    this.webhookVerifyToken = webhookVerifyToken;

    this.logger.log(
      'Meta API Service initialized successfully with configurations.'
    );

    this.logger.debug(`Webhook Verify Token: ${this.webhookVerifyToken}`);
  }

  /**
   * Send a message through Meta API (WhatsApp).
   * @param to Receiver phone number (including Country Code).
   * @param message Message text.
   * @returns AxiosResponse<MetaApiResponse>
   */
  async sendMessage(
    to: string,
    message: string
  ): Promise<AxiosResponse<MetaApiResponse>> {
    const url = `${this.metaApiUrl}${this.phoneNumberId}/messages`;
    const headers = {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };

    let formattedTo = to;

    // Ensure the number starts with '+'
    if (!formattedTo.startsWith('+')) {
      formattedTo = `+${formattedTo}`;
    }

    // Specific logic for Brazilian phone numbers (DDD 83, adding '9' if missing)
    // This logic assumes 'to' is always a valid Brazilian number for this specific case.
    if (
      formattedTo.startsWith('+5583') &&
      formattedTo.length === 13 && // +55 (2 digits) + DDD (2 digits) + 8 digits = 12. If length is 13, it means one digit is missing
      formattedTo[5] !== '9' // Check if the 9th digit (after +5583) is not '9'
    ) {
      // Insert '9' after the DDD (at position 5, considering '+' at 0)
      formattedTo = `${formattedTo.substring(0, 5)}9${formattedTo.substring(5)}`;
      this.logger.debug(
        `[MetaApiService] Formatted Brazilian number: ${formattedTo}`
      );
    }

    const body = {
      messaging_product: 'whatsapp',
      to: formattedTo,
      type: 'text',
      text: {
        body: message,
      },
    };

    this.logger.log(`[MetaApiService] Sending message to ${formattedTo}.`);
    this.logger.debug(`URL: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<MetaApiResponse>(url, body, { headers })
      );

      this.logger.log(
        `[MetaApiService] Message sent successfully. Status: ${response.status}`
      );
      this.logger.debug(`API Response: ${JSON.stringify(response.data)}`);

      return response;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        this.logger.error(
          `[MetaApiService] Axios Error: ${error.message}`,
          error.stack
        );
        if (error.response) {
          this.logger.error(
            `[MetaApiService] Error Data from Meta API: ${JSON.stringify(error.response.data)} for recipient: ${to}`
          );
        }

        // Determine HTTP status for the HttpException
        const status = error.response?.status || HttpStatus.BAD_GATEWAY;
        // Extract Meta API specific error message if available
        const metaApiErrorData = error.response
          ?.data as MetaApiErrorResponseData;
        const metaErrorMessage =
          metaApiErrorData?.error?.message || error.message;

        // Throw a structured HttpException for the AllExceptionsFilter to catch
        throw new HttpException(
          {
            message: `Failed to send message via WhatsApp API: ${metaErrorMessage}`,
            statusCode: status,
            externalApiDetails: error.response
              ?.data as MetaApiErrorResponseData,
          },
          status
        );
      } else if (error instanceof Error) {
        this.logger.error(
          `[MetaApiService] Unexpected Error: ${error.message}`,
          error.stack
        );
        // Throw a generic HttpException for other standard Errors
        throw new HttpException(
          { message: `Internal error in Meta API service: ${error.message}` },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      } else {
        this.logger.error(
          '[MetaApiService] Unknown error while sending message.'
        );
        // Throw a generic HttpException for completely unknown error types
        throw new HttpException(
          { message: 'Unknown error communicating with WhatsApp API.' },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  /**
   * Returns webhook verification token
   */
  getWebhookVerifyToken(): string {
    return <string>this.webhookVerifyToken;
  }
}

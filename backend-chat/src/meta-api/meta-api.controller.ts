import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { MetaApiService } from './meta-api.service';
import { WhatsappWebhookPayload } from '../common/interfaces/whatsapp-webhook-message.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('webhook')
export class MetaApiController {
  private readonly logger = new Logger(MetaApiController.name);

  constructor(
    private readonly metaApiService: MetaApiService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response
  ) {
    const verifyToken = this.metaApiService.getWebhookVerifyToken();

    if (mode === 'subscribe' && token === verifyToken) {
      this.logger.log('[MetaApiController - GET] success connecting meta api');
      return res.status(200).send(challenge);
    } else {
      this.logger.log('[MetaApiController - GET] error connecting meta api');
      return res.sendStatus(403);
    }
  }

  @Post()
  handleWebhook(@Body() payload: WhatsappWebhookPayload, @Res() res: Response) {
    res.sendStatus(HttpStatus.OK);

    this.logger.log('[MetaApiController - POST] POST Webhook received.');

    try {
      if (payload.object === 'whatsapp_business_account') {
        for (const entry of payload.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              if (
                change.value.messages &&
                Array.isArray(change.value.messages)
              ) {
                for (const message of change.value.messages) {
                  const from = message.from;
                  const type = message.type;

                  this.logger.log(
                    `[MetaApiController - POST] Received message from: ${from}`
                  );
                  this.logger.log(
                    `[MetaApiController - POST] Message type: ${type}`
                  );

                  if (type === 'text' && message.text?.body) {
                    const textBody = message.text.body;
                    this.logger.log(
                      ` [MetaApiController - POST] Content: "${textBody}"`
                    );

                    this.eventEmitter.emit('whatsapp.incomingMessage', message);
                  } else {
                    this.logger.log(
                      `[MetaApiController - POST] Non-text message received.`
                    );
                  }
                }
              } else {
                this.logger.log(
                  '[MetaApiController - POST] Message not found on this webhook event.'
                );
              }
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `[MetaApiController - POST] Error processing webhook: ${error.message}`,
          error.stack
        );
      } else {
        this.logger.error(
          `[MetaApiController - POST] Unknow error processing webhook. Details: ${JSON.stringify(error)}`
        );
      }
    }
  }
}

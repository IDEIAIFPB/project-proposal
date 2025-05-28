import { BadGatewayException } from '@nestjs/common';

export class WhatsAppBadResponseException extends BadGatewayException {
  constructor() {
    super(
      'Resposta inesperada da API do WhatsApp. Nenhum ID de mensagem retornado.',
    );
  }
}

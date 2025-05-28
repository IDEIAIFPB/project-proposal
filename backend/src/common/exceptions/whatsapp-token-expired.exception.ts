import { UnauthorizedException } from '@nestjs/common';

export class WhatsAppTokenExpiredException extends UnauthorizedException {
  constructor() {
    super('Token do WhatsApp expirado. Por favor, renove seu token.');
  }
}

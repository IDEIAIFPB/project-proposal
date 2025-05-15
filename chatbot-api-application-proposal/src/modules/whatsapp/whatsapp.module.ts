import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppGateway } from 'src/infra/gateways/whatsapp.gateway';

@Module({
    imports: [],
    controllers: [WhatsAppController],
    providers: [WhatsAppService, WhatsAppGateway],
})
export class WhatsAppModule {}

import { Injectable } from '@nestjs/common';
import { SendMessageUseCase } from 'src/core/use-cases/send-message.use-case';
import { WhatsAppGateway } from 'src/infra/gateways/whatsapp.gateway';


@Injectable()
export class WhatsAppService {
    private readonly sendMessageUseCase: SendMessageUseCase;

    constructor(private readonly whatsappGateway: WhatsAppGateway) {
        this.sendMessageUseCase = new SendMessageUseCase(this.whatsappGateway);
    }

    async sendMessage(to: string, message: string): Promise<any> {
        return await this.sendMessageUseCase.execute(to, message);
    }
}

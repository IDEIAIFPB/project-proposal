import { WhatsAppGatewayInterface } from "src/domain/interfaces/whatsapp-gateway.interface";

export class SendMessageUseCase {
    constructor(private readonly gateway: WhatsAppGatewayInterface) {}

    async execute(to: string, message: string): Promise<any> {
        if (!to || !message) {
            throw new Error("Receiver number and message are required.");
        }
        return await this.gateway.sendMessage(to, message);
    }
}
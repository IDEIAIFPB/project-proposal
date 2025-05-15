export interface WhatsAppGatewayInterface {
    sendMessage(to: string, message: string): Promise<any>;
};

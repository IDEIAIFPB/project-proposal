import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { WhatsAppService } from "./whatsapp.service";
import { OnEvent } from "@nestjs/event-emitter";
import { MessageValueDto } from "./dto/messages/message-value.dto";
import { StatusValueDto } from "./dto/status/status-value.dto";
import { WsSendMessageDto } from "./dto/send-message.dto";

@WebSocketGateway({
    namespace: "/whatsapp",
    cors: {
        origin: "http://localhost:3001"
    }
})
export class WhatsAppGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(WhatsAppGateway.name);

    constructor(
        private readonly service: WhatsAppService
    ) { }

    private getPhoneNumberId(client: Socket) {
        const { phone_number_id } = client.handshake.query;
        return Array.isArray(phone_number_id) ? phone_number_id[0] : phone_number_id;
    }

    private handleInvalidConnection(client: Socket, reason: string) {
        client.disconnect(true);
        this.logger.error(`Connection failed: ${reason}`);
    }

    async handleConnection(client: Socket) {
        const phoneNumberId = this.getPhoneNumberId(client);

        if (!phoneNumberId)
            return this.handleInvalidConnection(client, "Phone number id is required");

        try {
            await client.join(`user:${phoneNumberId}`);
            this.logger.log(`Client connected: ${phoneNumberId} (${client.id})`);
        } catch (error) {
            this.handleInvalidConnection(client, error instanceof Error ? error.message : "Unknown error");
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage("send-message")
    async handleSendMessage(client: Socket, payload: WsSendMessageDto) {
        const phoneNumberId = this.getPhoneNumberId(client);

        if (!phoneNumberId)
            return this.handleInvalidConnection(client, "Phone number id is required");

        const response = await this.service.sendMessage({
            phone_number_id: phoneNumberId,
            ...payload
        });

        return {
            status: response.status,
            data: response.data
        };
    }

    @OnEvent("message.received")
    handleReceivedMessageEvent(payload: MessageValueDto) {
        this.server.to(`user:${payload.metadata.phone_number_id}`).emit("new_messages", payload);
    }

    @OnEvent("status.updated")
    handleStatusUpdated(payload: StatusValueDto) {
        this.server.to(`user:${payload.metadata.phone_number_id}`).emit("new_statuses", payload);
    }
}

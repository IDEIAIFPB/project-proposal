import { BadRequestException, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { SendMessageDto } from "./dto/send-message.dto";

import { firstValueFrom } from "rxjs";
import { WhatsAppApiResponse } from "./interfaces/whatsapp-api.interface";
import { AxiosResponse } from "axios";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { FieldType } from "./dto/shared/enums/field-type.enum";
import { WebhookEntryDto } from "./dto/webhook-entry.dto";

@Injectable()
export class WhatsAppService {
    constructor(
        private readonly http: HttpService,
        private readonly emitter: EventEmitter2
    ) { }

    async sendMessage(dto: SendMessageDto): Promise<AxiosResponse<WhatsAppApiResponse>> {
        const url = `https://graph.facebook.com/v22.0/${dto.phone_number_id}/messages`;

        const payload = {
            messaging_product: "whatsapp",
            to: dto.to,
            type: "text",
            text: { body: dto.message }
        };

        const headers = {
            Authorization: `Bearer ${dto.access_token}`,
            "Content-Type": "application/json",
        };

        const response: AxiosResponse<WhatsAppApiResponse> = await firstValueFrom(
            this.http.post(url, payload, { headers })
        );

        return response;
    }

    handleWebhookEntry(entry: WebhookEntryDto) {
        for (const change of entry.changes) {
            switch (change.field) {
                case FieldType.MESSAGES:
                    this.emitter.emit("messages" in change.value ? "message.received" : "status.updated", change.value);
                    break;
                default:
                    throw new BadRequestException("Invalid field type");
            }
        }
    }
}

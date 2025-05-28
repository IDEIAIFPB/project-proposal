import { Controller, Get, Post, Body, Query, ForbiddenException } from "@nestjs/common";
import { WhatsAppService } from "./whatsapp.service";
import { WebhookNotificationDto } from "./dto/webhook-notification.dto";

@Controller("whatsapp")
export class WhatsAppController {
    constructor(private readonly service: WhatsAppService) { }

    @Get("webhook")
    verifyWebhook(
        @Query("hub.mode") mode: string,
        @Query("hub.verify_token") token: string,
        @Query("hub.challenge") challenge: string
    ) {
        if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN)
            return challenge;
        throw new ForbiddenException("Invalid token");
    }

    @Post("webhook")
    handleWebhook(@Body() body: WebhookNotificationDto) {
        console.log("Webhook received:", JSON.stringify(body, null, 2));
        for (const entry of body.entry)
            this.service.handleWebhookEntry(entry);
        return { received: true };
    }
}

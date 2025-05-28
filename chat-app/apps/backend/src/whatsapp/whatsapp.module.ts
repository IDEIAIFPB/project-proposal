import { Module } from "@nestjs/common";
import { WhatsAppController } from "./whatsapp.controller";
import { WhatsAppService } from "./whatsapp.service";
import { HttpModule } from "@nestjs/axios";
import { WhatsAppGateway } from "./whatsapp.gateway";
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
    imports: [HttpModule, EventEmitterModule.forRoot()],
    controllers: [WhatsAppController],
    providers: [WhatsAppService, WhatsAppGateway]
})
export class WhatsAppModule { }

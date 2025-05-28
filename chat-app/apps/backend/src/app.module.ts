import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { WhatsAppModule } from "./whatsapp/whatsapp.module";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env"
        }),
        WhatsAppModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }

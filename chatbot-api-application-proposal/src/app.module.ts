import { Module } from '@nestjs/common';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';


@Module({
    imports: [WhatsAppModule],
})
export class AppModule {}

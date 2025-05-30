import { forwardRef, Logger, Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MetaApiModule } from '../meta-api/meta-api.module';

@Module({
  // apesar de metaapimodule não importar chatmodule diretamente, pode haver umar ordem de
  // inicialização. com forwardRef(() => MetaApiModule), adio a resolução do MetaApiModule
  // até que ele esteja completamnte inicializado. Garantindo que MetaApiService esteja
  // disponível para injeção no chatService.
  imports: [EventEmitterModule.forRoot(), forwardRef(() => MetaApiModule)],
  providers: [ChatService, ChatGateway, Logger],
  exports: [ChatService],
})
export class ChatModule {}

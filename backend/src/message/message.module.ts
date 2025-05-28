import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}

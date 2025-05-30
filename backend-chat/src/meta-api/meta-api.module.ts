import { Module } from '@nestjs/common';
import { MetaApiService } from './meta-api.service';
import { ConfigModule } from '@nestjs/config';
import { MetaApiController } from './meta-api.controller';
import { HttpModule } from '@nestjs/axios';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [ConfigModule, HttpModule, EventEmitterModule],
  providers: [MetaApiService],
  exports: [MetaApiService],
  controllers: [MetaApiController],
})
export class MetaApiModule {}

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiResponse } from 'src/common/interfaces/response.interface';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageService } from './message.service';

@Controller('send-message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  sendMessage(
    @Body() sendMessageDto: SendMessageDto,
  ): Observable<ApiResponse<{ messageId: string }>> {
    return this.messageService.sendMessage(sendMessageDto);
  }
}

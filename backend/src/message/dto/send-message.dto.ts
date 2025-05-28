import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  to: string; // Número de telefone do destinatário

  @IsString()
  @IsNotEmpty()
  message: string; // Conteúdo da mensagem
}

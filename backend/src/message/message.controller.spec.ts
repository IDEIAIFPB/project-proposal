import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, firstValueFrom, of, throwError } from 'rxjs'; // Adicionado firstValueFrom
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiResponse } from 'src/common/interfaces/response.interface';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

describe('MessageController', () => {
  let controller: MessageController;
  // Removido mockMessageService daqui pois o sendMessageMock já é o que precisamos para o mock do serviço
  let sendMessageMock: Mock<
    [SendMessageDto],
    Observable<ApiResponse<{ messageId: string }>>
  >;

  beforeEach(() => {
    sendMessageMock = vi.fn();
    const mockMessageServiceInstance = {
      // Renomeado para clareza
      sendMessage: sendMessageMock,
    } as unknown as MessageService;

    controller = new MessageController(mockMessageServiceInstance);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    const dtoSucesso: SendMessageDto = {
      to: '5511981816780',
      message: 'Enviar mensagem',
    };

    const mockMessageId =
      'wamid.HBgNNTUxMTk4MTgxNjc4MBUCABEYEjM4ODg0OUY5MEEyRjVDRjgzQQA=';

    const respostaServicoSucesso: ApiResponse<{ messageId: string }> = {
      success: true,
      data: { messageId: mockMessageId },
      message: 'Mensagem enviada com sucesso.',
    };

    it('deve chamar messageService.sendMessage e retornar o valor de sucesso do serviço', async () => {
      // Adicionado async
      sendMessageMock.mockReturnValueOnce(of(respostaServicoSucesso));

      const observable = controller.sendMessage(dtoSucesso);
      const result = await firstValueFrom(observable); // Usando firstValueFrom

      expect(result).toEqual(respostaServicoSucesso);
      expect(sendMessageMock).toHaveBeenCalledTimes(1);
      expect(sendMessageMock).toHaveBeenCalledWith(dtoSucesso);
    });

    const dtoErroApi: SendMessageDto = {
      to: '5599999999999',
      message: 'Mensagem a enviar',
    };

    const mensagemErroApi =
      'Erro na comunicação com a API do WhatsApp: (#131030) Recipient phone number not in allowed list';
    const erroServicoSimulado = new HttpException(
      mensagemErroApi,
      HttpStatus.BAD_REQUEST,
    );

    it('deve propagar HttpException se o serviço retornar um erro da API do WhatsApp', async () => {
      // Adicionado async
      sendMessageMock.mockReturnValueOnce(
        throwError(() => erroServicoSimulado),
      );

      const observable = controller.sendMessage(dtoErroApi);

      // Usando expect(...).rejects.toThrowError() para lidar com promises rejeitadas
      await expect(firstValueFrom(observable)).rejects.toThrowError(
        HttpException,
      );
      // Você também pode ser mais específico com a mensagem e o status se desejar:
      await expect(firstValueFrom(observable)).rejects.toMatchObject({
        message: mensagemErroApi,
        status: HttpStatus.BAD_REQUEST,
      });

      expect(sendMessageMock).toHaveBeenCalledTimes(1);
      expect(sendMessageMock).toHaveBeenCalledWith(dtoErroApi);
    });

    const erroGenericoServico = new BadRequestException(
      'Erro genérico do serviço',
    );
    const dtoQualquer: SendMessageDto = { to: '123', message: 'teste' };

    it('deve propagar BadRequestException se o serviço a lançar', async () => {
      // Adicionado async
      sendMessageMock.mockReturnValueOnce(
        throwError(() => erroGenericoServico),
      );

      const observable = controller.sendMessage(dtoQualquer);

      await expect(firstValueFrom(observable)).rejects.toThrowError(
        BadRequestException,
      );
      await expect(firstValueFrom(observable)).rejects.toThrowError(
        'Erro genérico do serviço',
      );

      expect(sendMessageMock).toHaveBeenCalledTimes(1);
      expect(sendMessageMock).toHaveBeenCalledWith(dtoQualquer);
    });
  });
});

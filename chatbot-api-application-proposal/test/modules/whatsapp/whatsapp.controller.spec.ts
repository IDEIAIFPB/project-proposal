import { Test, TestingModule } from '@nestjs/testing';
import { WhatsAppController } from '@src/modules/whatsapp/whatsapp.controller';
import { SendMessageUseCase } from '@src/core/use-cases/send-message.use-case';

describe('WhatsAppController', () => {
  let controller: WhatsAppController;
  let sendMessageUseCase: SendMessageUseCase;

  beforeEach(async () => {
    const mockSendMessageUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WhatsAppController],
      providers: [
        {
          provide: SendMessageUseCase,
          useValue: mockSendMessageUseCase,
        },
      ],
    }).compile();

    controller = module.get<WhatsAppController>(WhatsAppController);
    sendMessageUseCase = module.get<SendMessageUseCase>(SendMessageUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call SendMessageUseCase with correct parameters', async () => {
    const dto = {
      phone: '5511999999999',
      message: 'Hello World!',
    };

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

    (sendMessageUseCase.execute as jest.Mock).mockResolvedValue({ message: 'ok' });

    const response = await controller.sendMessage(dto, mockRes as any);

    expect(sendMessageUseCase.execute).toHaveBeenCalledWith(dto.phone, dto.message);
    expect(response).toEqual({ message: 'ok' });
  });

  it('should throw if SendMessageUseCase fails', async () => {
    const dto = {
      phone: '',
      message: '',
    };

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

    (sendMessageUseCase.execute as jest.Mock).mockRejectedValue(
      new Error('Recipient number and message are required.')
    );

    await expect(controller.sendMessage(dto, mockRes as any)).rejects.toThrow(
      'Recipient number and message are required.'
    );
  });
});
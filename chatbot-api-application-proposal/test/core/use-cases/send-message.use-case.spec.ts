import { SendMessageUseCase } from '@src/core/use-cases/send-message.use-case';
import { WhatsAppGatewayInterface } from '@src/domain/interfaces/whatsapp-gateway.interface';

describe('SendMessageUseCase', () => {
  let sendMessageUseCase: SendMessageUseCase;
  let mockGateway: WhatsAppGatewayInterface;

  beforeEach(() => {
    mockGateway = {
      sendMessage: jest.fn().mockResolvedValue({ message: 'ok' }),
    };

    sendMessageUseCase = new SendMessageUseCase(mockGateway);
  });

  it('should successfully send a message', async () => {
    const result = await sendMessageUseCase.execute('5511999999999', 'Hello World!');

    expect(mockGateway.sendMessage).toHaveBeenCalledWith('5511999999999', 'Hello World!');
    expect(result).toEqual({ message: 'ok' });
  });

  it('should throw an error if the phone number is empty', async () => {
    await expect(sendMessageUseCase.execute('', 'Hello')).rejects.toThrow(
      'Receiver number and message are required.'
    );
  });

  it('should throw an error if the message is empty', async () => {
    await expect(sendMessageUseCase.execute('5511999999999', '')).rejects.toThrow(
      'Receiver number and message are required.'
    );
  });
});
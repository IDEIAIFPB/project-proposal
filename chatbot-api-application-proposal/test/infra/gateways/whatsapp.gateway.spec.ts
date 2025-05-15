import { WhatsAppGateway } from '@src/infra/gateways/whatsapp.gateway';
import axios from 'axios';


jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WhatsAppGateway', () => {
  let gateway: WhatsAppGateway;

  beforeEach(() => {
    gateway = new WhatsAppGateway();
    jest.clearAllMocks();
  });

  it('should send message successfully via Graph API', async () => {
    const phone = '5511999999999';
    const message = 'Hello from tests';
    const fakeResponse = { data: { message: 'sent' } };

    mockedAxios.post.mockResolvedValue(fakeResponse);

    const result = await gateway.sendMessage(phone, message);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('https://graph.facebook.com'),
      {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: {
          body: message,
        },
      },
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Bearer '),
        }),
      })
    );
    expect(result).toEqual({ message: 'sent' });
  });

  it('should throw error if axios fails', async () => {
    mockedAxios.post.mockRejectedValue(new Error('API failed'));

    await expect(gateway.sendMessage('5511999999999', 'Hello')).rejects.toThrow(
      'API failed'
    );
  });
});
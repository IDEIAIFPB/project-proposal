import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Env } from '../../config/env.config';
import { WhatsAppGatewayInterface } from 'src/domain/interfaces/whatsapp-gateway.interface';


@Injectable()
export class WhatsAppGateway implements WhatsAppGatewayInterface {
    async sendMessage(to: string, message: string): Promise<any> {
        const url = `https://graph.facebook.com/v19.0/${Env.PHONE_NUMBER_ID}/messages`;
        const response = await axios.post(
            url,
            {
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: { body: message },
            },
            {
                headers: {
                    Authorization: `Bearer ${Env.ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            },
        );
        return response.data;
    }
};
import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';


@Controller('whatsapp')
export class WhatsAppController {
    constructor(private readonly whatsappService: WhatsAppService) {}

    @Post('send')
    async sendMessage(@Body() body: { phone: string; message: string }, @Res() res: any) {
        try {
            const { phone, message } = body;
            const response = await this.whatsappService.sendMessage(phone, message);
            return res.status(200).json({ success: true, data: response });
        } catch (err) {
            console.error('Error sending message:', err);
            return res.status(400).json({ success: false, message: 'Failed to send message', error: err.message });
        }
    }

    @Post('webhook')
    webhook(@Req() req: any, @Res() res: any) {
        console.log('Webhook received:', JSON.stringify(req.body, null, 2));
        res.status(200).send('Webhook received');
    }
}
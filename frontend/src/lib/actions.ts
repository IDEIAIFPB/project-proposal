'use server';

import axios from 'axios';
import { ActionResult } from 'next/dist/server/app-render/types';

interface SendMessagePayload {
    to: string;
    message: string;
}

export async function sendMessageToServerAction(
    payload: SendMessagePayload
): Promise<ActionResult> {
    const { to, message } = payload;

    try {
        const response = await axios.post(
            `${process.env.API_BASE_URL}/send-message`,
            { to, message },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.API_TOKEN}`, // TODO: Adicionar autenticação de rotas no backend
                },
            }
        );
        // console.log("sendMessageToServerAction: ", response.data); // DEBUG

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response.data;
        }

        return {
            success: false,
            error: {
                message: error instanceof Error ? error.message : 'Erro inesperado no servidor.',
            },
        };
    }
}

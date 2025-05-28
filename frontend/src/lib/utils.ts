import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApiResult } from './types-api';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatErrorMessage(apiResult: ApiResult): string {
    const genericErrorMessage = "Ocorreu um problema ao processar sua solicitação. Tente novamente.";

    if (!apiResult || apiResult.success || !apiResult.error) {
        // Esta função deve ser chamada idealmente apenas se apiResult.success for false.
        // Se por algum motivo não houver erro ou a propriedade error estiver ausente,
        // retorna uma mensagem genérica.
        return genericErrorMessage;
    }

    const errorDetails = apiResult.error;

    // Caso 1: apiResult.error é uma string simples
    if (typeof errorDetails === 'string') {
        return `Erro: ${errorDetails}`;
    }

    // Caso 2: apiResult.error é um objeto (ApiErrorDetail)
    if (typeof errorDetails === 'object' && errorDetails !== null) {
        let formattedMessage = "Erro";

        if (errorDetails.name) {
            formattedMessage += ` (${errorDetails.name})`;
        }
        formattedMessage += ": ";

        if (Array.isArray(errorDetails.messages) && errorDetails.messages.length > 0) {
            // Junta todas as mensagens do array
            formattedMessage += errorDetails.messages.join(". ");
        } else if (errorDetails.message && typeof errorDetails.message === 'string') {
            // Se não houver 'messages' array, mas houver 'message' string no objeto de erro
            formattedMessage += errorDetails.message;
        } else {
            // Se não houver nenhuma mensagem específica no objeto de erro
            formattedMessage += "Detalhes indisponíveis.";
        }
        return formattedMessage;
    }

    // Fallback para qualquer outro caso inesperado
    return genericErrorMessage;
}
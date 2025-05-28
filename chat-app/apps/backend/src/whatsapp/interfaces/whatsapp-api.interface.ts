export interface WhatsAppApiResponse {
    messaging_product: string;
    contacts: WhatsAppContact[];
    messages: WhatsAppMessage[];
    error?: WhatsAppApiError;
}

export interface WhatsAppContact {
    input: string;
    wa_id: string;
}

export interface WhatsAppMessage {
    id: string;
}

export interface WhatsAppApiError {
    code: number;
    message: string;
    error_subcode?: number;
    fbtrace_id: string;
}


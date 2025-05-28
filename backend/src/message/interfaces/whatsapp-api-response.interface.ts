export interface WhatsAppMessage {
  id: string;
}

export interface WhatsAppError {
  message: string;
  type: string;
  code: number;
  error_subcode?: number;
  fbtrace_id?: string;
  error_data?: any;
}

export interface WhatsAppApiResponse {
  messaging_product?: string;
  contacts?: { input: string; wa_id: string }[];
  messages?: WhatsAppMessage[];
  error?: WhatsAppError;
}

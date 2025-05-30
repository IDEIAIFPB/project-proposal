export interface WhatsappWebhookMessage {
  from: string;
  id: string;
  timestamp: string;
  text?: {
    body: string;
  };
  type: string;
}

export interface WhatsappWebhookContact {
  profile: {
    name: string;
  };
  wa_id: string;
}

export interface WhatsappWebhookMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsappWebhookValue {
  messaging_product: string;
  metadata: WhatsappWebhookMetadata;
  contacts?: WhatsappWebhookContact[];
  messages?: WhatsappWebhookMessage[];
  statuses?: any[];
}

export interface WhatsappWebhookChange {
  value: WhatsappWebhookValue;
  field: string;
}

export interface WhatsappWebhookEntry {
  id: string;
  changes: WhatsappWebhookChange[];
}

export interface WhatsappWebhookPayload {
  object: string;
  entry: WhatsappWebhookEntry[];
}

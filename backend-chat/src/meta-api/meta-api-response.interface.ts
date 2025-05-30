export interface MetaApiContact {
  input: string;
  wa_id: string;
}

export interface MetaApiMessage {
  id: string;
}

export interface MetaApiResponse {
  messaging_product: string;
  contacts?: MetaApiContact[];
  messages: MetaApiMessage[];
}

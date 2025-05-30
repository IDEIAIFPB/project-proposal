export interface MetaApiResponse {
  // Resposta para envio de mensagem bem-sucedido
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string; // WAMID da mensagem
  }>;
}
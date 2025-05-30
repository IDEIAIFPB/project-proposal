export interface ChatMessage {
  id: string;
  from: string;
  to: string;
  timestamp: string;
  text?: string;
  type: 'incoming' | 'outgoing';
}

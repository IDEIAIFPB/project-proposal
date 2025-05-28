export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    name: string;
    messages: string[];
  };
  statusCode?: number;
  timestamp?: string;
  path?: string;
}

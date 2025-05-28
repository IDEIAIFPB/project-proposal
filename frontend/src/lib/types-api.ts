export interface ApiErrorDetail {
    messages?: string[];
    name?: string;
    message?: string;
}

export interface SuccessPayload {
    success: boolean;
    data: {
        messageId?: string;
    };
    message: string;
}

export interface ApiErrorDetail {
    messages?: string[];
    name?: string;
    message?: string;
}

export interface ApiResult<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
    error?: ApiErrorDetail | string;
    statusCode?: number;
    timestamp?: string;
    path?: string;
}
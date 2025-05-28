
export enum MessageStatus {
    PENDING = "pending",
    SENT = "sent",
    DELIVERED = "delivered",
    READ = "read",
    FAILED = "failed"
}

export const MessageStatusPriority: Record<MessageStatus, number> = {
    [MessageStatus.PENDING]: 1,
    [MessageStatus.SENT]: 2,
    [MessageStatus.DELIVERED]: 3,
    [MessageStatus.READ]: 4,
    [MessageStatus.FAILED]: 0,
};

export type MessageType = "text" | "";

export interface TextContent {
    body: string;
}

export interface ReceivedMessage {
    id: string;
    from: string;
    timestamp: string;
    type: MessageType;
    text?: TextContent;
    status?: MessageStatus;
    errors?: Error[];
}

export interface Contact {
    wa_id: string;
    profile: {
        name: string;
    };
}

export interface StatusUpdate {
    id: string;
    recipient_id: string;
    timestamp: string;
    status: MessageStatus;
    conversation?: {
        id: string;
        expiration_timestamp?: string;
    };
    errors?: Error[];
}


export interface SentMessageResponse {
    messages: {
        id: string;
    }[];
}

export interface Metadata {
    display_phone_number: string;
    phone_number_id: string;
}

export interface ReceivedMessages {
    messaging_product: "whatsapp";
    metadata: Metadata;
    messages: ReceivedMessage[];
    contacts: Contact[];
}

export interface StatusUpdates {
    messaging_product: "whatsapp";
    metadata: Metadata;
    statuses: StatusUpdate[];
}

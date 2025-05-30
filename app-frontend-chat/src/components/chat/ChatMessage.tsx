// components/chat/ChatMessage.tsx
import React from 'react';
import { ChatMessage as TChatMessage } from '@/components/providers/providers';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
    message: TChatMessage;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isIncoming = message.type === 'incoming';
    const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div
            className={cn(
                "flex w-full",
                isIncoming ? "justify-start" : "justify-end"
            )}
        >
            <div
                className={cn(
                    "max-w-[70%] p-3 rounded-lg text-sm shadow-sm",
                    isIncoming
                        ? "bg-gray-200 text-gray-800 rounded-bl-none"
                        : "bg-blue-500 text-white rounded-br-none"
                )}
            >
                <p>{message.text}</p>
                <p className={cn("mt-1 text-right text-xs", isIncoming ? "text-gray-600" : "text-blue-200")}>
                    {time}
                </p>
            </div>
        </div>
    );
}
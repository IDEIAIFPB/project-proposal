'use client';

import React, { useEffect, useRef } from 'react';
import { useSocket, ChatMessage as TChatMessage } from '@/components/providers/providers';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function ChatContainer() {
    const { conversations, currentConversationPhoneNumber } = useSocket();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentMessages: TChatMessage[] = currentConversationPhoneNumber
        ? conversations.get(currentConversationPhoneNumber) || []
        : [];

    // Scrolla para o final da lista de mensagens
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentMessages]); // Roda quando novas mensagens chegam

    return (
        <Card className="flex-1 flex flex-col bg-white">
            {currentConversationPhoneNumber ? (
                <>
                    <h2 className="p-4 text-lg font-semibold border-b">
                        Conversa com: {currentConversationPhoneNumber}
                    </h2>
                    <ScrollArea className="flex-1 p-4 space-y-4">
                        {currentMessages.length === 0 ? (
                            <p className="text-center text-gray-500 text-sm">No messages in this conversation.</p>
                        ) : (
                            currentMessages.map((msg, index) => (
                                <ChatMessage key={index} message={msg} />
                            ))
                        )}
                        <div ref={messagesEndRef} /> {/* Ponto para scrollar */}
                    </ScrollArea>
                    <ChatInput toPhoneNumber={currentConversationPhoneNumber} />
                </>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                    <p>Select a conversation to start.</p>
                </div>
            )}
        </Card>
    );
}
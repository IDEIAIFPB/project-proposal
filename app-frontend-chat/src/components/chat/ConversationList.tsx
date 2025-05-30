// components/chat/ConversationList.tsx
'use client';

import React from 'react';
import { useSocket } from '@/components/providers/providers';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export function ConversationList() {
    const { conversations, currentConversationPhoneNumber, setCurrentConversationPhoneNumber } = useSocket();

    // Transforma o Map em um Array para mapear
    const conversationNumbers = Array.from(conversations.keys());

    return (
        <Card className="w-full max-w-xs flex-shrink-0 bg-white">
            <h2 className="p-4 text-lg font-semibold border-b">Conversations</h2>
            <ScrollArea className="h-[calc(100vh-120px)]"> {/* ajusta aqui a altura conforme necessário */}
                {conversationNumbers.length === 0 ? (
                    <p className="p-4 text-gray-500 text-sm">No active conversation.</p>
                ) : (
                    <div className="flex flex-col">
                        {conversationNumbers.map(phoneNumber => (
                            <div
                                key={phoneNumber}
                                onClick={() => setCurrentConversationPhoneNumber(phoneNumber)}
                                className={cn(
                                    "p-4 cursor-pointer border-b last:border-b-0 hover:bg-gray-50",
                                    currentConversationPhoneNumber === phoneNumber && "bg-blue-50 text-blue-700 font-medium"
                                )}
                            >
                                <p className="text-sm">Cliente: {phoneNumber}</p>
                                <p className="text-xs text-gray-500">
                                    Total of Messages: {conversations.get(phoneNumber)?.length || 0}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </Card>
    );
}
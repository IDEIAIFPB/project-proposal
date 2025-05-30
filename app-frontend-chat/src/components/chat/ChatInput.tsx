'use client';

import React, { useState } from 'react';
import { useSocket } from '@/components/providers/providers';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizonal } from 'lucide-react';
import {toast} from "sonner";

interface ChatInputProps {
    toPhoneNumber: string;
}

export function ChatInput({ toPhoneNumber }: ChatInputProps) {
    const { sendMessage, isConnected } = useSocket();
    const [message, setMessage] = useState('');

    const handleSendMessage = () => {
        if (message.trim() && isConnected) {
            sendMessage(toPhoneNumber, message.trim());
            setMessage('');
        } else if (!isConnected) {
            console.warn('Not connected to the chat server');
            toast.warning('Not connected to the chat server');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="flex p-4 border-t bg-white">
            <Input
                type="text"
                placeholder={isConnected ? "Type your message..." : "Connecting to the chat..."}
                value={message}
                onChange={(e: { target: { value: React.SetStateAction<string>; }; }) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 mr-2"
                disabled={!isConnected}
            />
            <Button onClick={handleSendMessage} disabled={!isConnected || !message.trim()}>
                <SendHorizonal className="size-4 mr-2" />
                Send
            </Button>
        </div>
    );
}
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Send, Smile } from 'lucide-react';
import { useState } from 'react';

interface ChatInputProps {
    onSend: (message: string) => void;
    isSending?: boolean;
}

export function ChatInput({ onSend, isSending = false }: ChatInputProps) {
    const [message, setMessage] = useState('');

    const handleSendClick = () => {
        if (!message.trim() || isSending) return; // Não envia se estiver enviando ou mensagem vazia
        onSend(message);
        setMessage('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
        }
    };

    return (
        <div className="flex items-center gap-2 p-4 border-t dark:border-zinc-600 bg-white dark:bg-zinc-800">
            <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 flex-shrink-0"
                disabled={isSending} // Desabilita se estiver enviando
            >
                <Smile className="h-5 w-5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 flex-shrink-0"
                disabled={isSending} // Desabilita se estiver enviando
            >
                <Plus className="h-5 w-5" />
            </Button>
            <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isSending ? 'Enviando...' : 'Digite uma mensagem'}
                className="flex-1 bg-gray-100 dark:bg-zinc-700 border-transparent focus:bg-white dark:focus:bg-zinc-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-lg px-4 py-2"
                disabled={isSending} // Desabilita se estiver enviando
            />
            <Button
                onClick={handleSendClick}
                className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 rounded-lg flex-shrink-0 disabled:opacity-70 disabled:cursor-not-allowed" // Adicionado estilo para desabilitado
                disabled={isSending} // Desabilita se estiver enviando
            >
                {isSending ? (
                    // Spinner simples
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <>
                        <Send className="h-5 w-5" /> Enviar
                    </>
                )}
            </Button>
        </div>
    );
}

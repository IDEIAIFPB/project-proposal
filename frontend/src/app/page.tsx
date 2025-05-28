"use client";

import { ChatAreaHeader } from "@/components/chat/chat-area-header";
import { ConversationSidebar } from "@/components/chat/chat-conversation-sidebar";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessage } from "@/components/chat/chat-message";
import { Sidebar } from "@/components/layout/sidebar";

import { sendMessageToServerAction } from "@/lib/actions";
import { Message } from "@/lib/type-message";
import { ApiResult } from "@/lib/types-api";
import { formatErrorMessage } from "@/lib/utils";

import { useEffect, useRef, useState, useTransition } from "react";

const currentChatPartner = {
    name: "Jéfter Harpia",
    status: "Usuário",
    avatarUrl: "/avatar.webp",
    phoneNumber: process.env.NEXT_PUBLIC_WHATSAPP_PHONE!
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isPending, startTransition] = useTransition();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Efeito para rolar para baixo quando novas mensagens chegam
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (messageContent: string) => {
        if (!messageContent.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            content: messageContent,
            sender: "user",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, userMessage]);

        startTransition(async () => {
            const result: ApiResult<{ message: string }> = await sendMessageToServerAction({
                to: currentChatPartner.phoneNumber,
                message: messageContent,
            });

            if (result.success) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        content: result.data?.message || "Mensagem processada com sucesso pela API.",
                        sender: "bot",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    },
                ]);
            } else {
                // console.log("RESULT [RESULT FALSE]: ", result); // DEBUG
                const formattedError = formatErrorMessage(result);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: Date.now() + 1,
                        content: formattedError,
                        sender: "bot",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    },
                ]);
            }
        });
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <ConversationSidebar />
            <div className="flex-1 flex flex-col bg-white dark:bg-zinc-700">
                <ChatAreaHeader
                    name={currentChatPartner.name}
                    status={currentChatPartner.status}
                    avatarUrl={currentChatPartner.avatarUrl}
                />
                <main className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-zinc-700">
                    <div className="text-center my-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-zinc-600 px-3 py-1 rounded-lg shadow-sm">
                            HOJE
                        </span>
                    </div>
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} {...msg} />
                    ))}
                    {/* Elemento invisível para ajudar no scroll para o final */}
                    <div ref={messagesEndRef} />
                </main>
                <ChatInput onSend={handleSend} isSending={isPending} />
            </div>
        </div>
    );
}
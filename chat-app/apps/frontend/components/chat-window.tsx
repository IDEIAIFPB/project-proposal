"use client";

import { useCallback, useState } from "react";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { useWhatsAppSocket } from "@/hooks/use-whatsApp-socket";
import {
    MessageStatus,
    MessageStatusPriority,
    ReceivedMessage, ReceivedMessages,
    StatusUpdates
} from "@/types/api";
import { MessageBubble } from "./ui/message-bubble";
import { MessageInput } from "./ui/message-input";

interface Chat {
    id: string;
    name: string;
    unread: number;
    avatar: string;
    online: boolean;
}

interface Message extends ReceivedMessage {
    chat: string;
}

interface ChatWindowProps {
    accessToken: string;
    phoneNumberId: string;
}

export function ChatWindow({ accessToken, phoneNumberId }: ChatWindowProps) {
    const [activeChat, setActiveChat] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [chats, setChats] = useState<Chat[]>([]);

    const handleNewMessages = useCallback((received: ReceivedMessages) => {
        received.messages.forEach((message) => {
            setChats(prev => {
                const exists = prev && prev.some(chat => chat.id === message.from);
                const contact = received.contacts.find(contact => contact.wa_id === message.from);

                return exists ? prev : [{
                    id: contact!.wa_id,
                    name: contact!.profile.name,
                    avatar: "",
                    unread: 0,
                    online: true
                }, ...prev];
            });
            setMessages(prev => {
                const exists = prev && prev.some(m => m.id === message.id);
                return exists ? prev : [...prev, { ...message, chat: message.from }];
            });
        });
    }, []);

    const handleStatusUpdates = useCallback((updates: StatusUpdates) => {
        updates.statuses.forEach((status) => {
            setMessages(prev => {
                const updated = prev.map((message) => message.id === status.id
                    && MessageStatusPriority[message.status || MessageStatus.FAILED] < MessageStatusPriority[status.status] ? {
                    ...message,
                    status: status.status
                } : message);
                return updated;
            });
        });
    }, []);


    const handleError = useCallback((error: Error) => {
        console.error("WebSocket Error:", error);
    }, []);


    const { sendMessage } = useWhatsAppSocket({
        phoneNumberId: phoneNumberId,
        accessToken: accessToken,
        onNewMessages: handleNewMessages,
        onStatusUpdates: handleStatusUpdates,
        onError: handleError
    });

    const handleSendMessage = async () => {
        try {
            const text = newMessage.trim();
            if (activeChat && text) {
                const timestamp = new Date().getTime() / 1000;
                const result = await sendMessage(activeChat, text);

                setMessages(prev => [...prev, {
                    id: result.messages[0].id,
                    from: phoneNumberId,
                    chat: activeChat,
                    timestamp: timestamp.toString(),
                    type: "text",
                    status: MessageStatus.PENDING,
                    text: { body: text }
                }]);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setNewMessage("");
        }
    };

    return (
        <div className="h-screen bg-gray-100 dark:bg-gray-900">
            <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
                <ResizablePanel defaultSize={30} minSize={25} maxSize={35}>
                    <div className="h-screen bg-white dark:bg-gray-800 p-4 border-r">
                        <div className="mb-4">
                            <Input placeholder="Pesquisar ou começar nova conversa" className="rounded-full" />
                        </div>

                        <ScrollArea className="h-[calc(100vh-140px)]">
                            {chats && chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    onClick={() => setActiveChat(chat.id)}
                                    className={cn(
                                        "flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-lg",
                                        activeChat === chat.id && "bg-gray-100 dark:bg-gray-700"
                                    )}
                                >
                                    <Avatar className="relative">
                                        <AvatarImage src={chat.avatar} />
                                        <AvatarFallback>{chat.name[0]}</AvatarFallback>
                                        {chat.online && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                                        )}
                                    </Avatar>
                                    <div className="ml-4 flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">{chat.name}</h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                                {
                                                    messages.findLast(message =>
                                                        message.chat === chat.id)?.text?.body
                                                    || "Ainda não há messagens..."
                                                }
                                            </p>
                                            {chat.unread > 0 && (
                                                <span className="bg-green-500 text-white rounded-full px-2 py-1 text-xs">
                                                    {chat.unread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                </ResizablePanel>

                <ResizablePanel defaultSize={70}>
                    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
                        {activeChat ? (
                            <>
                                <div className="p-4 border-b flex items-center bg-white dark:bg-gray-800">
                                    <Avatar>
                                        <AvatarImage src={chats.find(c => c.id === activeChat)?.avatar} />
                                        <AvatarFallback>
                                            {chats.find(c => c.id === activeChat)?.name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="ml-4">
                                        <h2 className="font-semibold">
                                            {chats.find(c => c.id === activeChat)?.name}
                                        </h2>
                                        <p className="text-sm text-green-500">
                                            {chats.find(c => c.id === activeChat)?.online ? "online" : "offline"}
                                        </p>
                                    </div>
                                </div>

                                <ScrollArea className="flex-1 p-4">
                                    <div
                                        className="flex flex-col gap-4 p-6"
                                        role="log"
                                        aria-live="polite"
                                        aria-atomic="false"
                                    >
                                        {messages.filter(message => message.chat === activeChat).length === 0 && (
                                            <div className="flex-1 flex items-center justify-center text-muted-foreground">
                                                Nenhuma mensagem ainda
                                            </div>
                                        )}

                                        {messages.filter(message => message.chat === activeChat).map((message) => (
                                            <div
                                                key={message.id}
                                                className={cn(
                                                    "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                                                    message.from === phoneNumberId ? "justify-end" : "justify-start"
                                                )}
                                                role="listitem"
                                                aria-label={`Mensagem de ${message.from === phoneNumberId ? "você" : "contato"}`}
                                            >
                                                <MessageBubble
                                                    message={message}
                                                    isSender={message.from === phoneNumberId}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                                <MessageInput
                                    value={newMessage}
                                    onChange={setNewMessage}
                                    onSend={handleSendMessage}
                                />
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <p className="text-gray-500">Selecione uma conversa</p>
                            </div>
                        )}
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div >
    );
}

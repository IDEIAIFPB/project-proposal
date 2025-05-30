'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Message type
export interface ChatMessage {
    id: string;
    from: string;
    to: string;
    timestamp: string;
    text?: string;
    type: 'incoming' | 'outgoing';
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    conversations: Map<string, ChatMessage[]>;
    currentConversationPhoneNumber: string | null;
    setCurrentConversationPhoneNumber: (phoneNumber: string | null) => void;
    sendMessage: (to: string, message: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    // Map de conversas: "número do cliente" -> [lista de ChatMessages]
    const [conversations, setConversations] = useState<Map<string, ChatMessage[]>>(new Map());
    const [currentConversationPhoneNumber, setCurrentConversationPhoneNumber] = useState<string | null>(null);

    useEffect(() => {
        console.log('DEBUGLOG: useEffect in SocketProvider is RUNNING'); // Log de execução do useEffect

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        console.log('DEBUGLOG: Connecting to backend at:', backendUrl);

        const newSocket = io(backendUrl, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Listener para o evento 'connect'
        const handleConnect = () => {
            setIsConnected(true);
            console.log('DEBUGLOG: Successfully CONNECTED to WebSocket server. Socket ID:', newSocket.id);
            toast.success('Conectado ao servidor de chat!');

            console.log('DEBUGLOG: Registering event listeners (incomingMessage, outgoingMessage, messageSendError) AFTER connect');

            // Listener para 'incomingMessage'
            const handleIncomingMessage = (message: ChatMessage) => {
                console.log('DEBUGLOG: Frontend received INCOMING_MESSAGE:', message);
                setConversations(prevConversations => {
                    const newConversations = new Map(prevConversations);
                    if (message && message.id && message.from) {
                        const conversationKey = message.from;

                        if (!newConversations.has(conversationKey)) {
                            newConversations.set(conversationKey, []);
                        }
                        const messagesArray = newConversations.get(conversationKey);

                        // VERIFICAÇÃO PARA EVITAR DUPLICATAS PELO ID
                        const messageExists = messagesArray?.some(
                            (existingMsg) => existingMsg.id === message.id && existingMsg.text === message.text
                        );

                        if (!messageExists) { // SÓ ADICIONA SE NÃO EXISTIR
                            newConversations.get(message.from)?.push(message);
                        } else {
                            console.log(`DEBUGLOG (setConversations for outgoing): Message ALREADY EXISTS. Not pushing.`);
                        }

                    }
                    return newConversations;
                });
            };
            newSocket.on('incomingMessage', handleIncomingMessage);

            // Listener para 'outgoingMessage'
            const handleOutgoingMessage = (message: ChatMessage) => {
                if (message) {
                    try {
                        const messageClone = JSON.parse(JSON.stringify(message));
                        console.log('DEBUGLOG: Received message object (cloned):', messageClone);
                    } catch (e) {
                        console.error('DEBUGLOG: Error cloning message object for logging:', e);
                        console.log('DEBUGLOG: Received message object (raw):', message);
                    }
                } else {
                    console.log('DEBUGLOG: Received message object is null or undefined.');
                }
                setConversations(prevConversations => {
                    const newConversations = new Map(prevConversations);
                    if (message && message.to) {
                        const conversationKey = message.to;
                        if (!newConversations.has(conversationKey)) {
                            newConversations.set(conversationKey, []);
                        }
                        const messagesArray = newConversations.get(conversationKey);

                        // VERIFICAÇÃO PARA EVITAR DUPLICATAS PELO ID
                        const messageExists = messagesArray?.some(
                            (existingMsg) => existingMsg.id === message.id && existingMsg.text === message.text
                        );

                        if (!messageExists) { // SÓ ADICIONA SE NÃO EXISTIR
                            messagesArray?.push(message);
                        } else {
                            console.log(`DEBUGLOG (setConversations for outgoing): Message ALREADY EXISTS. Not pushing.`);
                        }

                    } else {
                        console.error('DEBUGLOG: Cannot process outgoing message for state update, message or message.to is invalid:', message);
                    }
                    return newConversations;
                });
            };
            newSocket.on('outgoingMessage', handleOutgoingMessage);

            // Listener para 'messageSendError'
            const handleMessageSendError = (data: { success: boolean; error: string }) => {
                toast.error(`Failed sending message: ${data.error}`);
            };
            newSocket.on('messageSendError', handleMessageSendError);
        };
        newSocket.on('connect', handleConnect);


        // Listener para o evento 'disconnect'
        const handleDisconnect = () => {
            setIsConnected(false);
            toast.error('Disconnected from the chat server!');
        };
        newSocket.on('disconnect', handleDisconnect);

        // Listener para o evento 'connect_error'
        const handleConnectError = (err: Error) => {
            toast.error(`Connection error: ${err.message}`);
        };
        newSocket.on('connect_error', handleConnectError);

        setSocket(newSocket);

        // Função de Limpeza do useEffect
        return () => {
            // Remove os listeners específicos para evitar duplicação em HMR ou remontagens
            newSocket.off('connect', handleConnect);
            newSocket.off('disconnect', handleDisconnect);
            newSocket.off('connect_error', handleConnectError);

            newSocket.removeAllListeners('incomingMessage');
            newSocket.removeAllListeners('outgoingMessage');
            newSocket.removeAllListeners('messageSendError');

            newSocket.disconnect();
        };
    }, []); // Array de dependências vazio

    // Função para enviar mensagens via WebSocket
    const sendMessage = (to: string, message: string) => {
        if (socket && isConnected) {
            socket.emit('sendMessage', { to, message });
        } else {
            toast.warning('Not connected to the chat. Please try again later.');
        }
    };

    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
            conversations,
            currentConversationPhoneNumber,
            setCurrentConversationPhoneNumber,
            sendMessage
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
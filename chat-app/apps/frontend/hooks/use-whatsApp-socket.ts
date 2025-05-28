import { ReceivedMessages, SentMessageResponse, StatusUpdates } from "@/types/api";
import { AxiosResponse } from "axios";
import { useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface UseWhatsAppSocketProps {
    phoneNumberId: string;
    accessToken: string;
    onNewMessages: (message: ReceivedMessages) => void;
    onStatusUpdates: (update: StatusUpdates) => void;
    onError: (error: Error) => void;
}

export function useWhatsAppSocket({
    phoneNumberId,
    accessToken,
    onNewMessages,
    onStatusUpdates,
    onError
}: UseWhatsAppSocketProps) {
    const socketRef = useRef<Socket | null>(null);

    if (socketRef.current == null) {
        socketRef.current = io("http://localhost:3000/whatsapp", {
            query: {
                phone_number_id: phoneNumberId,
                access_token: accessToken
            }
        });
    }

    const handleMessages = useCallback((data: ReceivedMessages) => {
        onNewMessages(data);
    }, [onNewMessages]);

    const handleStatuses = useCallback((data: StatusUpdates) => {
        onStatusUpdates(data);
    }, [onStatusUpdates]);

    useEffect(() => {
        const socket = socketRef.current!;

        socket.on("connect", () => console.log("Conectado ao WS"));
        socket.on("new_messages", handleMessages);
        socket.on("new_statuses", handleStatuses);
        socket.on("error", onError);

        return () => {
            socket.off("new_messages", handleMessages);
            socket.off("new_statuses", handleStatuses);
            socket.disconnect();
        };
    }, [handleMessages, handleStatuses, onError]);

    const sendMessage = async (to: string, message: string): Promise<SentMessageResponse> => {
        return new Promise((resolve, reject) => {
            socketRef.current!.emit(
                "send-message",
                { to, message },
                (response: AxiosResponse<SentMessageResponse>) => {
                    if (response.status === 200)
                        resolve(response.data);
                    else
                        reject(response.data);
                }
            );
        });
    };

    return {
        sendMessage,
        setTyping: (isTyping: boolean) => {
            socketRef.current?.emit(isTyping ? "typing_start" : "typing_stop", { phoneNumberId });
        }
    };
};

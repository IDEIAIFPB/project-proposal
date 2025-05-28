import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Check, CheckCheck, Clock } from "lucide-react";
import { MessageStatus, ReceivedMessage } from "@/types/api";

interface MessageBubbleProps {
    message: ReceivedMessage;
    isSender: boolean;
}

export function MessageBubble({ message, isSender }: MessageBubbleProps) {
    const receivedDate = new Date(
        Number.parseInt(message.timestamp) * 1000
    ).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    return (
        <Card
            className={cn(
                "flex flex-col gap-2 p-4 relative transition-colors max-w-[90%]",
                isSender
                    ? "ml-auto bg-primary text-primary-foreground hover:bg-primary/90"
                    : "mr-auto bg-muted hover:bg-muted/80"
            )}
        >
            {message.errors && message.errors?.length > 0 && (
                <Alert variant="destructive" className="mb-2 p-2">
                    <span className="text-xs">{message.errors[0].message}</span>
                </Alert>
            )}

            <div className="space-y-2">
                {message.type === "text" && message.text?.body ? (
                    <p className="text-sm break-words" style={{ wordBreak: "break-word" }}>{message.text.body}</p>
                ) : (
                    <p className="text-sm text-muted-foreground italic">
                        [Mensagem não suportada]
                    </p>
                )}
            </div>

            <div className="flex justify-between items-center gap-2">
                <span className="text-xs text-muted-foreground/70">
                    {receivedDate}
                </span>

                {isSender && message.status && (
                    <div className="flex items-center gap-1">
                        {message.status === MessageStatus.READ ? (
                            <CheckCheck className="h-3 w-3 text-blue-400" />
                        ) : message.status === MessageStatus.DELIVERED ? (
                            <CheckCheck className="h-3 w-3" />
                        ) : message.status === MessageStatus.SENT ? (
                            <Check className="h-3 w-3" />
                        ) : message.status === MessageStatus.PENDING ?
                            <Clock className="h-3 w-3" /> : null}
                    </div>
                )}
            </div>
        </Card>
    );
};


import { Button } from "./button";
import { Input } from "./input";

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => Promise<void>;
    disabled?: boolean;
};

export function MessageInput({
    value,
    onChange,
    onSend,
    disabled
}: MessageInputProps) {
    return (
        <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Digite uma mensagem"
                    className="flex-1"
                    onKeyUp={(e) => {
                        if (e.key === "Enter" && !disabled)
                            onSend();
                    }}
                    disabled={disabled}
                />
                <Button
                    onClick={() => {
                        onSend();
                    }}
                    disabled={disabled || !value.trim()}
                >
                    Enviar
                </Button>
            </div>
        </div>
    );
}

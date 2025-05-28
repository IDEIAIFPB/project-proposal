import { Plus, Smile } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface InputAreaProps {
  addMessage: (message: string) => void;
}

export const InputArea = ({ addMessage }: InputAreaProps) => {
  const [message, setMessage] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()

      if (message.trim() != "") {
        addMessage(message);
      }

      setMessage("")
    }
  }

  return (
    <div className="border-t px-7 py-4 bg-white dark:bg-zinc-900 flex items-center gap-3">
      <div className="flex gap-2 pr-1">
        <Button variant="ghost" size="icon" className="outline-0">
          <Smile className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="outline-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Input
        placeholder="Digite uma mensagem"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 h-9 focus-visible:ring-0"
      />

      <Button className="h-9">Enviar</Button>
    </div>
  );
}

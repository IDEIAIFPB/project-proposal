"use client";

import { EllipsisVertical, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@radix-ui/react-scroll-area";

import { ChatMessage } from "@/app/@types/chatMessage";
import { MessageSender } from "@/app/enum/type";
import { ChatMessageItem } from "./chatMessageItem";
import { InputArea } from "./inputArea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const MainChat = () => {
  const [chatMessages, setChatMessages] = useState<Array<ChatMessage>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addMessage = (message: string) => {
    const chatMessage: ChatMessage = {
      message,
      from: MessageSender.Bot,
      timestamp: new Date(),
    };

    sendMessage(message);

    setChatMessages((prev) => [...prev, chatMessage]);
  };

  const sendMessage = async (message: string) => { }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Avatar className="size-11">
            <AvatarImage src="/images/my_photo.jpeg" />
            <AvatarFallback>D</AvatarFallback>
          </Avatar>

          <div>
            <div className="font-semibold">Dário</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Usuário</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="outline-0">
            <Search className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="outline-0">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { }}>Action 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { }}>Action 2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { }}>Action 3</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { }}>Action 4</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { }}>Action 5</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat Content */}
      <div className="h-full overflow-auto p-6 space-y-4 bg-zinc-100 dark:bg-zinc-800">
        <div className="flex justify-center my-4">
          <div className="bg-white dark:bg-zinc-900 px-3 py-1 rounded-lg text-sm text-muted-foreground font-medium shadow-sm">
            HOJE
          </div>
        </div>

        {chatMessages.map((chatMessage, index) => (
          <ChatMessageItem key={index} chatMessage={chatMessage} />
        ))}

        <div ref={bottomRef} />
      </div>

      <InputArea addMessage={addMessage} />
    </div>
  );
};

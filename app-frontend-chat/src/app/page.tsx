'use client';

import { ConversationList } from "@/components/chat/ConversationList";
import { ChatContainer } from "@/components/chat/ChatContainer";
import { useSocket } from "@/components/providers/providers";

export default function HomePage() {
  const { isConnected } = useSocket();

  return (
      <div className="flex flex-1 overflow-hidden">
        <ConversationList />
        <div className="flex-1 flex flex-col">
          <header className="p-4 bg-white shadow-sm border-b">
            <h1 className="text-xl font-bold">Operator Chat</h1>
            <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              Server Status: {isConnected ? 'Connected' : 'Unconnected'}
            </p>
          </header>
          <ChatContainer />
        </div>
      </div>
  );
}
import { ChatMessage } from "@/app/@types/chatMessage";
import { MessageSender } from "@/app/enum/type";

interface ChatMessageProps {
  chatMessage: ChatMessage;
}

export const ChatMessageItem = ({ chatMessage }: ChatMessageProps) => {
  const isUser = chatMessage.from === MessageSender.User;

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col gap-1 max-w-xl">
        <div className="text-gray-400 text-xs ">
          {chatMessage.timestamp.getHours().toString().padStart(2, '0')}:
          {chatMessage.timestamp.getMinutes().toString().padStart(2, '0')}
        </div>

        <div
          className={`px-4 py-2 shadow ${
            isUser
              ? 'bg-white dark:bg-zinc-900 rounded-l-xl rounded-se-xl'
              : 'bg-gray-200 dark:bg-zinc-700 rounded-r-xl rounded-ss-xl max-w-xs'
          }`}
        >
          {chatMessage.message}
        </div>
      </div>
    </div>
  );
}

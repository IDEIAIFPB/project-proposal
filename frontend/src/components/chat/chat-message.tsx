interface ChatMessageProps {
    content: string;
    sender: 'user' | 'bot';
    timestamp?: string;
}
export function ChatMessage({ content, sender, timestamp }: ChatMessageProps) {
    const isUser = sender === 'user';
    return (
        <div className={`flex my-1.5 text-sm w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex flex-col items-${isUser ? 'end' : 'start'} max-w-[70%] gap-1`}>
                {timestamp && (
                    <span className={`flex ${isUser ? 'justify-end' : 'justify-start'} text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap`}>
                        {timestamp}
                    </span>
                )}
                <div
                    className={`px-3.5 py-2 shadow-sm break-words ${isUser
                        ? 'bg-black-100 dark:bg-black-600 text-black-800 dark:text-white rounded-t-lg rounded-l-lg'
                        : 'bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-100 rounded-t-lg rounded-r-lg'
                        }`}
                >
                    {content}
                </div>
            </div>
        </div>
    );
}

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Search } from 'lucide-react';

interface ChatAreaHeaderProps {
    name: string;
    status: string;
    avatarUrl: string;
}

export function ChatAreaHeader({ name, status, avatarUrl }: ChatAreaHeaderProps) {
    return (
        <header className="flex items-center justify-between p-4 border-b dark:border-zinc-600 bg-white dark:bg-zinc-800">
            <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarUrl} alt={name} />
                    <AvatarFallback>{name.substring(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{status}</p>
                </div>
            </div>
            <div className="flex items-center space-x-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                >
                    <Search className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                >
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}

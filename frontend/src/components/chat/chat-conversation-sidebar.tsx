import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Search } from 'lucide-react';

const conversations = Array(4)
    .fill(null)
    .map((_, i) => ({
        id: i,
        name: `Harpia ${i + 1}`,
        preview: 'Prévia da mensagem d...',
        timestamp: '15/04/24',
        avatarUrl: `https://i.pravatar.cc/100?u=contact${i + 1}`,
        active: i === 0,
    }));

// TODO: Props para dados do usuário, conversas, etc.
// interface ConversationSidebarProps {
//     // currentUser?: { name: string; status: string; avatarUrl: string; };
//     // conversations?: typeof conversations;
//     // onSelectConversation?: (id: number) => void;
//     // activeConversationId?: number;
// }

type ConversationSidebarProps = Record<string, never>;

export function ConversationSidebar({ }: ConversationSidebarProps) {
    // Exemplo de dados do usuário (deveria vir de props ou contexto)
    const currentUser = {
        name: 'Harpia 1',
        status: 'Bot',
        avatarUrl: 'https://i.pravatar.cc/100?u=contact1',
    };

    return (
        <div className="w-80 bg-white dark:bg-zinc-800 border-r dark:border-zinc-700 flex flex-col h-screen">
            {/* Cabeçalho do Perfil do Usuário */}
            <div className="p-4 border-b dark:border-zinc-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                            <AvatarFallback>
                                {currentUser.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">
                                {currentUser.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {currentUser.status}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 dark:text-gray-400 hover:text-purple-200 dark:hover:text-purple-100"
                    >
                        <Bell className="h-5 w-5" />
                    </Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        type="search"
                        placeholder="Pesquisar"
                        className="pl-10 pr-3 py-2 text-sm bg-gray-100 dark:bg-zinc-700 border-transparent focus:bg-white dark:focus:bg-zinc-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-md w-full"
                    />
                </div>
            </div>

            {/* Lista de Conversas */}
            <div className="flex-1 overflow-y-auto">
                {conversations.map((convo) => (
                    <div
                        key={convo.id}
                        className={`p-3 flex items-center space-x-3 cursor-pointer border-b border-gray-100 dark:border-zinc-700 last:border-b-0
                        ${convo.active
                                ? 'bg-purple-50 dark:bg-purple-300 dark:bg-opacity-20 border-l-2 border-purple-200 dark:border-purple-200'
                                : 'hover:bg-gray-50 dark:hover:bg-zinc-700'
                            }`}
                    // onClick={() => onSelectConversation && onSelectConversation(convo.id)}
                    >
                        <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={convo.avatarUrl} alt={convo.name} />
                            <AvatarFallback>
                                {convo.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            {' '}
                            <div className="flex justify-between items-center">
                                <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">
                                    {convo.name}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-600 whitespace-nowrap ml-2">
                                    {convo.timestamp}
                                </p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                                {convo.preview}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

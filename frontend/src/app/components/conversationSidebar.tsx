import { Bell } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ConversationSidebar = () => {
  return (
    <div className="w-72 border-r bg-white dark:bg-zinc-900 flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <Avatar className="size-11">
          <AvatarImage src="/images/user_1.jpg" />
          <AvatarFallback>H1</AvatarFallback>
        </Avatar>

        <div>
          <div className="text-base font-medium">Harpia 1</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Bot</div>
        </div>

        <Bell className="ml-auto h-4 w-4" />
      </div>

      <div className="p-2">
        <Input
          placeholder="Pesquisar"
          className="h-9 focus-visible:ring-0"
        />
      </div>

      <ScrollArea className="flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-3 hover:bg-gray-200/70 dark:hover:bg-zinc-800/70 cursor-pointer border-b">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={`/images/user_${i + 1}.jpg`} />

                <AvatarFallback>H{i + 1}</AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <span className="font-medium text-sm">Harpia {i + 1}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Prévia da mensagem d...</span>
              </div>

              <span className="ml-auto text-xs text-gray-400">15/04/24</span>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

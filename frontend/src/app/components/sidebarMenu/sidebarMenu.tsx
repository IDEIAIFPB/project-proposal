import { LayoutGrid, ListFilter, LucideLogOut, MessageSquareText, Settings, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

import { ToggleThemeButton } from "./toggleThemeButton"

export const SidebarMenu = () => {
  return (
    <div className="flex flex-col items-center w-20 h-full py-6 border-rspace-y-6 bg-zinc-100 dark:bg-zinc-950">
      <div className="flex flex-col gap-6">
        <Button variant="ghost" size="icon" className="hover:bg-zinc-200 hover:text-accent-foreground">
          <Users />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-zinc-200 hover:text-accent-foreground">
          <LayoutGrid />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-zinc-200 hover:text-accent-foreground">
          <ListFilter />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-zinc-200 hover:text-accent-foreground">
          <MessageSquareText />
        </Button>
        <Button variant="ghost" size="icon" className="hover:bg-zinc-200 hover:text-accent-foreground">
          <Settings />
        </Button>
      </div>

      <div className="flex-grow" />

      <div className="flex flex-col items-center gap-6 mt-4">
        <ToggleThemeButton />

        <Button variant="ghost" size="icon" className="hover:bg-zinc-200 hover:text-accent-foreground">
          <LucideLogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
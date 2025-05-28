import { ConversationSidebar } from "./components/conversationSidebar";
import { MainChat } from "./components/mainChat/mainChat";
import { SidebarMenu } from "./components/sidebarMenu/sidebarMenu";

export const Chat = () => {
  return (
    <div className="flex h-screen">
      <SidebarMenu />

      <ConversationSidebar />

      <MainChat />
    </div>
  );
}

import { ChatWindow } from "@/components/chat-window";

export default function Home() {
    return (
        <div className="h-screen">
            <ChatWindow
                accessToken={process.env.WHATSAPP_ACCESS_TOKEN!}
                phoneNumberId={process.env.WHATSAPP_PHONE_NUMBER_ID!}
            />
        </div>
    );
}

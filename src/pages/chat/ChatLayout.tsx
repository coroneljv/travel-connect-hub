import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { setActiveRole } from "@/hooks/useChatStore";
import type { ChatRole } from "@/hooks/useChatStore";
import ChatList from "./ChatList";
import ChatThread from "./ChatThread";

export default function ChatLayout() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { uiRole } = useAuth();

  // Sync chat store with the logged-in user's role
  useEffect(() => {
    if (uiRole) {
      setActiveRole(uiRole as ChatRole);
    }
  }, [uiRole]);

  return (
    <div className="h-[calc(100vh-80px)] -mx-6 -mt-4 md:-mx-40 flex flex-col">
      {conversationId ? (
        <ChatThread conversationId={conversationId} />
      ) : (
        <ChatList />
      )}
    </div>
  );
}

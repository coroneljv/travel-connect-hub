import { useState } from "react";
import { ArrowLeft, Search, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import { useChatStore } from "@/hooks/useChatStore";
import ChatListItem from "@/components/shared/ChatListItem";
import EmptyState from "@/components/shared/EmptyState";

export default function ChatList() {
  const { conversations } = useChatStore();
  const [search, setSearch] = useState("");

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  const filtered = search
    ? conversations.filter((c) =>
        c.participantName.toLowerCase().includes(search.toLowerCase()),
      )
    : conversations;

  const pinned = filtered.filter((c) => c.isPinned);
  const regular = filtered.filter((c) => !c.isPinned);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-tc-text-primary hover:text-tc-text-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-tc-text-primary">
              Mensagens
            </h1>
            {totalUnread > 0 && (
              <p className="text-sm text-tc-text-hint">
                {totalUnread} mensagen{totalUnread !== 1 ? "s" : ""} não lida
                {totalUnread !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-white border border-border rounded-lg px-3 py-2.5 gap-2">
            <Search className="h-4 w-4 text-tc-text-hint shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversas..."
              className="flex-1 bg-transparent text-sm placeholder:text-tc-text-hint outline-none"
            />
          </div>
          <button className="shrink-0 bg-rose-500 rounded-lg p-2.5 hover:bg-rose-600 transition-colors">
            <Search className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {/* Pinned */}
        {pinned.length > 0 && (
          <>
            <div className="flex items-center gap-2 px-6 py-2">
              <Pin className="h-3.5 w-3.5 text-tc-text-hint" />
              <span className="text-sm font-medium text-tc-text-primary">
                Fixadas
              </span>
            </div>
            {pinned.map((c) => (
              <ChatListItem
                key={c.id}
                id={c.id}
                name={c.participantName}
                avatar={c.participantAvatar}
                isOnline={c.isOnline}
                lastMessage={c.lastMessageText}
                lastTime={c.lastMessageTime}
                unreadCount={c.unreadCount}
              />
            ))}
          </>
        )}

        {/* All conversations */}
        {regular.length > 0 && (
          <>
            <div className="px-6 py-2 mt-2">
              <span className="text-sm font-medium text-tc-text-primary">
                Todas as Conversas
              </span>
            </div>
            {regular.map((c) => (
              <ChatListItem
                key={c.id}
                id={c.id}
                name={c.participantName}
                avatar={c.participantAvatar}
                isOnline={c.isOnline}
                lastMessage={c.lastMessageText}
                lastTime={c.lastMessageTime}
                unreadCount={c.unreadCount}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {filtered.length === 0 && !search && (
          <EmptyState
            title="Você ainda não tem conversas"
            description="Candidate-se a uma oportunidade para iniciar uma conversa"
            actionLabel="Explorar oportunidades"
            actionHref="/opportunities"
          />
        )}

        {/* No search results */}
        {filtered.length === 0 && search && (
          <EmptyState title="Nenhuma conversa encontrada" />
        )}
      </div>
    </div>
  );
}

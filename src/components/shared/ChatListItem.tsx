import { Link } from "react-router-dom";

interface ChatListItemProps {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
}

export default function ChatListItem({
  id,
  name,
  avatar,
  isOnline,
  lastMessage,
  lastTime,
  unreadCount,
}: ChatListItemProps) {
  return (
    <Link
      to={`/chat/${id}`}
      className="flex items-center gap-3 px-6 py-3.5 border-b border-border/60 hover:bg-muted/50 transition-colors"
    >
      {/* Avatar + Online dot */}
      <div className="relative shrink-0">
        <img
          src={avatar}
          alt={name}
          className="h-12 w-12 rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-tc-online border-2 border-white" />
        )}
      </div>

      {/* Name + Last message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-tc-text-primary truncate">{name}</p>
        <p className="text-sm text-tc-text-hint truncate">{lastMessage}</p>
      </div>

      {/* Unread badge */}
      <div className="flex flex-col items-end gap-1.5 shrink-0">
        {unreadCount > 0 && (
          <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-[11px] font-medium text-white bg-navy-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
}

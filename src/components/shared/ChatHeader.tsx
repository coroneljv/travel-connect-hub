import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";

interface ChatHeaderProps {
  participantName: string;
  participantAvatar: string;
  isOnline: boolean;
  backHref?: string;
  onPhoneClick?: () => void;
  onVideoClick?: () => void;
  onMoreClick?: () => void;
}

export default function ChatHeader({
  participantName,
  participantAvatar,
  isOnline,
  backHref = "/chat",
  onPhoneClick,
  onVideoClick,
  onMoreClick,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0 bg-white">
      <div className="flex items-center gap-3">
        <Link
          to={backHref}
          className="text-tc-text-primary hover:text-tc-text-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <img
          src={participantAvatar}
          alt={participantName}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-medium text-tc-text-primary">
            {participantName}
          </p>
          {isOnline && (
            <p className="flex items-center gap-1 text-xs text-tc-online">
              <span className="h-1.5 w-1.5 rounded-full bg-tc-online inline-block" />
              online
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPhoneClick}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Phone className="h-5 w-5 text-tc-text-secondary" />
        </button>
        <button
          type="button"
          onClick={onVideoClick}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Video className="h-5 w-5 text-tc-text-secondary" />
        </button>
        <button
          type="button"
          onClick={onMoreClick}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <MoreVertical className="h-5 w-5 text-tc-text-secondary" />
        </button>
      </div>
    </div>
  );
}

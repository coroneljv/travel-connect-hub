import { Check, CheckCheck, Clock } from "lucide-react";

interface MessageBubbleProps {
  text: string;
  isMine: boolean;
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read";
  avatar?: string;
  participantName?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({
  text,
  isMine,
  timestamp,
  status,
  avatar,
  participantName,
}: MessageBubbleProps) {
  return (
    <div className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
      {/* Other's avatar */}
      {!isMine && avatar && (
        <img
          src={avatar}
          alt={participantName ?? ""}
          className="h-8 w-8 rounded-full object-cover shrink-0"
        />
      )}

      <div className={`max-w-[70%] flex flex-col ${isMine ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed ${
            isMine
              ? "bg-navy-500 text-white rounded-t-2xl rounded-bl-2xl"
              : "bg-tc-chat-bubble text-tc-text-primary rounded-t-2xl rounded-br-2xl"
          }`}
        >
          {text}
        </div>

        {/* Timestamp + status */}
        <div className="flex items-center gap-1 mt-1">
          {isMine && status && (
            <>
              {status === "sending" && <Clock className="h-3 w-3 text-tc-text-hint" />}
              {status === "sent" && <Check className="h-3 w-3 text-tc-text-hint" />}
              {(status === "delivered" || status === "read") && (
                <CheckCheck className="h-3.5 w-3.5 text-tc-text-hint" />
              )}
            </>
          )}
          <span className="text-[11px] text-tc-text-hint">{formatTime(timestamp)}</span>
        </div>
      </div>
    </div>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { MapPin, Calendar, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/hooks/useChatStore";

type ApplicationStatus = "pending" | "accepted" | "rejected";

interface ApplicationCardProps {
  id: string;
  requestId: string;
  requestTitle: string;
  destination: string;
  hostName: string;
  status: ApplicationStatus;
  message: string | null;
  createdAt: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending: {
    label: "Pendente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  accepted: {
    label: "Aceita",
    bg: "bg-tc-green-bg",
    text: "text-tc-green-text",
    border: "border-tc-green-border",
  },
  rejected: {
    label: "Rejeitada",
    bg: "bg-tc-red-bg",
    text: "text-tc-red-text",
    border: "border-tc-red-border",
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ApplicationCard({
  id,
  requestId,
  requestTitle,
  destination,
  hostName,
  status,
  message,
  createdAt,
}: ApplicationCardProps) {
  const navigate = useNavigate();
  const { createConversationFromApplication } = useChatStore();
  const normalizedStatus: ApplicationStatus =
    status === "accepted" || status === "rejected" ? status : "pending";
  const config = STATUS_CONFIG[normalizedStatus];

  return (
    <div className="bg-white border border-border rounded-md p-5 flex flex-col gap-4">
      {/* Header: title + status badge */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <Link
            to={`/viajante/oportunidades/${requestId}`}
            className="text-base font-medium text-tc-text-primary hover:underline line-clamp-1"
          >
            {requestTitle}
          </Link>
          <div className="flex items-center gap-4 text-sm text-tc-text-secondary">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-tc-text-hint" />
              {destination}
            </span>
            <span className="text-tc-text-hint">por {hostName}</span>
          </div>
        </div>
        <span
          className={`shrink-0 px-3 py-1 text-xs font-medium rounded-pill border ${config.bg} ${config.text} ${config.border}`}
        >
          {config.label}
        </span>
      </div>

      {/* Message preview */}
      {message && (
        <p className="text-sm text-tc-text-secondary line-clamp-2">
          {message}
        </p>
      )}

      {/* Footer: date + actions */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-tc-text-hint">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {normalizedStatus === "pending" ? "Aguardando resposta" : "Respondida"}
          </span>
        </div>

        <div className="flex gap-2">
          <Link to={`/viajante/oportunidades/${requestId}`}>
            <Button variant="outline" size="sm" className="text-xs">
              Ver oportunidade
            </Button>
          </Link>
          {normalizedStatus === "accepted" && (
            <Button
              size="sm"
              className="text-xs bg-navy-500 hover:bg-navy-600 text-white gap-1"
              onClick={() => {
                const convId = createConversationFromApplication(id, {
                  name: hostName,
                  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName)}&background=364763&color=fff&size=96`,
                });
                navigate(`/chat/${convId}`);
              }}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Conversar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

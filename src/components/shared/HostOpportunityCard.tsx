import { MapPin, Users, Eye, Clock, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type OpportunityStatus = "open" | "closed";

export interface HostOpportunity {
  id: string;
  title: string;
  destination: string;
  description: string | null;
  category: string;
  imageUrl: string;
  status: OpportunityStatus;
  candidateCount: number;
  viewCount: number;
  duration: string;
}

interface HostOpportunityCardProps {
  opportunity: HostOpportunity;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const STATUS_CONFIG: Record<OpportunityStatus, { label: string; className: string }> = {
  open: {
    label: "Aberto",
    className: "bg-tc-green-bg text-tc-green-text border border-tc-green-border",
  },
  closed: {
    label: "Finalizado",
    className: "bg-tc-red-bg text-tc-red-text border border-tc-red-border",
  },
};

export default function HostOpportunityCard({
  opportunity: opp,
  onEdit,
  onDelete,
}: HostOpportunityCardProps) {
  const statusCfg = STATUS_CONFIG[opp.status];
  const isClosed = opp.status === "closed";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image with category badge */}
          <div className="relative sm:w-56 h-48 sm:h-auto shrink-0">
            <img
              src={opp.imageUrl}
              alt={opp.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 bg-navy-500 text-white text-xs font-medium px-3 py-1 rounded-md">
              {opp.category}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 flex flex-col gap-3">
            {/* Title + status */}
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-tc-text-primary">
                {opp.title}
              </h3>
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${statusCfg.className}`}
              >
                {statusCfg.label}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-tc-text-hint" />
              <span className="text-sm text-tc-text-secondary">
                {opp.destination}
              </span>
            </div>

            {/* Description */}
            {opp.description && (
              <p className="text-sm text-tc-text-secondary line-clamp-1">
                {opp.description}
              </p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-tc-text-hint">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {opp.candidateCount} candidatos
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {opp.viewCount} visualizacoes
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {opp.duration}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-auto pt-1">
              <Link to={`/anfitriao/oportunidades/${opp.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Ver Detalhes
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className={`gap-1.5 text-xs ${isClosed ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => onEdit?.(opp.id)}
                disabled={isClosed}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={`gap-1.5 text-xs text-tc-red-text hover:text-tc-red-text hover:bg-tc-red-bg ${isClosed ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => onDelete?.(opp.id)}
                disabled={isClosed}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

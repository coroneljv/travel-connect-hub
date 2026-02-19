import { CheckCircle2, Bookmark } from "lucide-react";

export type IntegrationStatus = "integrated" | "recommended" | "available";

interface IntegrationStatusBadgeProps {
  status: IntegrationStatus;
}

const CONFIG: Record<
  IntegrationStatus,
  { label: string; icon: typeof CheckCircle2 | typeof Bookmark; className: string } | null
> = {
  integrated: {
    label: "Integrado",
    icon: CheckCircle2,
    className: "bg-tc-green-bg text-tc-green-text border border-tc-green-border",
  },
  recommended: {
    label: "Recomendado",
    icon: Bookmark,
    className: "bg-navy-500 text-white",
  },
  available: null,
};

export default function IntegrationStatusBadge({ status }: IntegrationStatusBadgeProps) {
  const config = CONFIG[status];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

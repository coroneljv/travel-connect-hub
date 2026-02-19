import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && <Icon className="h-12 w-12 text-tc-text-placeholder mb-3" />}
      <p className="text-base font-medium text-tc-text-primary mb-1">
        {title}
      </p>
      {description && (
        <p className="text-sm text-tc-text-hint mb-4">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="px-4 py-2 bg-navy-500 text-white text-sm font-medium rounded-lg hover:bg-navy-600 transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

import { Link } from "react-router-dom";
import { MapPin, Star, Clock, Heart } from "lucide-react";

interface OpportunityCardProps {
  id: string;
  title: string;
  destination: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  imageUrl: string;
  matchPercent: number;
  rating: number;
  duration: string;
  compensationLabel: string;
  tags: string[];
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export default function OpportunityCard({
  id,
  title,
  destination,
  imageUrl,
  matchPercent,
  rating,
  duration,
  compensationLabel,
  tags,
  isFavorite = false,
  onToggleFavorite,
}: OpportunityCardProps) {
  return (
    <Link
      to={`/viajante/oportunidades/${id}`}
      className="bg-white border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
    >
      {/* Image + Match Badge + Favorite */}
      <div className="relative">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-[220px] object-cover rounded-t-[10px]"
        />
        {/* Heart button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className="absolute top-4 right-4 bg-navy-500/70 rounded-full p-2 hover:bg-navy-500/90 transition-colors"
        >
          <Heart
            className={`h-5 w-5 ${
              isFavorite ? "text-rose-400 fill-rose-400" : "text-white"
            }`}
          />
        </button>
        {/* Match Badge */}
        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#388E3C] border-4 border-white rounded-pill px-5 py-2 shadow-lg flex items-center gap-2">
          <Star className="h-4 w-4 text-white fill-white" />
          <span className="text-sm font-medium text-white whitespace-nowrap">
            {matchPercent}% Match
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 pt-8 flex flex-col gap-4">
        {/* Title + Location + Rating */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-base font-medium text-tc-text-primary truncate max-w-[220px]">
              {title}
            </p>
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-tc-text-hint" />
              <span className="text-sm text-tc-text-secondary truncate max-w-[200px]">
                {destination}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="text-sm text-tc-text-primary">{rating}</span>
          </div>
        </div>

        {/* Compensation label */}
        <span className="inline-flex self-start px-2.5 py-0.5 text-sm font-medium rounded-pill bg-tc-blue-bg text-tc-blue-text">
          {compensationLabel}
        </span>

        {/* Duration */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-tc-text-hint" />
          <span className="text-sm text-tc-text-secondary">{duration}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 text-sm font-medium rounded-pill bg-tc-blue-bg text-tc-blue-text"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

import { MapPin, Star, Calendar, CheckCircle2 } from "lucide-react";
import type { OpportunityDetail } from "@/hooks/useOpportunityDetail";

interface Props {
  opportunity: OpportunityDetail;
}

function ImageGallery({ images }: { images: string[] }) {
  return (
    <div className="space-y-3">
      {/* Top row: 3 images */}
      <div className="grid grid-cols-3 gap-3">
        {images.slice(0, 3).map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Foto ${i + 1}`}
            className="w-full h-[180px] object-cover rounded-md border border-border"
          />
        ))}
      </div>
      {/* Bottom row: 2 images centered */}
      <div className="grid grid-cols-3 gap-3">
        <div />
        {images.slice(3, 5).map((src, i) => (
          <img
            key={i + 3}
            src={src}
            alt={`Foto ${i + 4}`}
            className="w-full h-[180px] object-cover rounded-md border border-border"
          />
        ))}
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-navy-500 rounded-pill">
      {category}
    </span>
  );
}

function TitleBlock({
  title,
  hostName,
}: {
  title: string;
  hostName: string;
}) {
  return (
    <div>
      <h2 className="text-base font-medium text-tc-text-primary">{title}</h2>
      <p className="text-sm text-tc-text-secondary">por {hostName}</p>
    </div>
  );
}

function StatsRow({
  destination,
  rating,
  reviewCount,
  duration,
}: {
  destination: string;
  rating: number;
  reviewCount: number;
  duration: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-6 text-sm text-tc-text-secondary">
      <span className="flex items-center gap-1.5">
        <MapPin className="h-4 w-4 text-tc-text-hint" />
        {destination}
      </span>
      <span className="flex items-center gap-1.5">
        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
        {rating} ({reviewCount} avaliacoes)
      </span>
      <span className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4 text-tc-text-hint" />
        {duration}
      </span>
    </div>
  );
}

function AboutSection({ description }: { description: string | null }) {
  if (!description) return null;
  return (
    <div>
      <h3 className="text-base font-medium text-tc-text-primary mb-2">
        Sobre a Oportunidade
      </h3>
      <p className="text-sm leading-relaxed text-tc-text-secondary">
        {description}
      </p>
    </div>
  );
}

function ResponsibilitiesChecklist({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h3 className="text-base font-medium text-tc-text-primary mb-3">
        Responsabilidades
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-tc-text-secondary">
            <CheckCircle2 className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillsSection({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <div>
      <h3 className="text-base font-medium text-tc-text-primary mb-3">
        Habilidades Requeridas
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 text-xs font-medium rounded-full bg-navy-500 text-white"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

function HouseRulesSection({ rules }: { rules: string | null }) {
  if (!rules) return null;
  return (
    <div>
      <h3 className="text-base font-medium text-tc-text-primary mb-2">
        Regras da Casa
      </h3>
      <p className="text-sm leading-relaxed text-tc-text-secondary whitespace-pre-line">
        {rules}
      </p>
    </div>
  );
}

export default function OpportunityDetailSections({ opportunity }: Props) {
  return (
    <div className="space-y-5">
      <ImageGallery images={opportunity.images} />
      <CategoryBadge category={opportunity.category} />
      <TitleBlock title={opportunity.title} hostName={opportunity.hostName} />
      <StatsRow
        destination={opportunity.destination}
        rating={opportunity.rating}
        reviewCount={opportunity.reviewCount}
        duration={opportunity.duration}
      />
      <AboutSection description={opportunity.description} />
      <ResponsibilitiesChecklist items={opportunity.responsibilities} />
      <SkillsSection skills={opportunity.skills} />
      <HouseRulesSection rules={opportunity.houseRules} />
    </div>
  );
}

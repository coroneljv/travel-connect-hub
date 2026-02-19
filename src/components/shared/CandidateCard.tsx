import {
  MapPin,
  Star,
  Zap,
  Heart,
  CheckCircle2,
  Calendar,
  Clock,
  Mail,
  Eye,
  Check,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export type CandidateStatus = "pending" | "accepted" | "rejected";

export interface RequirementSkill {
  label: string;
  met: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  age: number;
  location: string;
  avatarUrl: string | null;
  rating: number;
  reviewCount: number;
  matchPercent: number;
  hasLiked: boolean;
  status: CandidateStatus;
  applicationDate: string;
  desiredStartDate: string;
  duration: string;
  languages: string[];
  skills: string[];
  requiredSkills: RequirementSkill[];
  optionalSkills: RequirementSkill[];
  message: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  opportunityId: string;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

const STATUS_CONFIG: Record<
  CandidateStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pendente",
    className: "text-amber-600",
  },
  accepted: {
    label: "Aceita",
    className: "text-tc-green-text",
  },
  rejected: {
    label: "Recusado",
    className: "text-tc-red-text",
  },
};

export default function CandidateCard({
  candidate: c,
  opportunityId,
  onAccept,
  onReject,
}: CandidateCardProps) {
  const statusCfg = STATUS_CONFIG[c.status];
  const initials = c.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 space-y-4">
        {/* ── Top row: avatar + info + badges + dates sidebar ── */}
        <div className="flex gap-4">
          {/* Left: avatar + info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 shrink-0">
                <AvatarImage src={c.avatarUrl ?? undefined} alt={c.name} />
                <AvatarFallback className="bg-navy-100 text-navy-700 text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                {/* Name + age + location + rating */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-tc-text-primary">
                    {c.name}, {c.age}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-tc-text-hint">
                    <MapPin className="h-3 w-3" />
                    {c.location}
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-tc-text-secondary">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    {c.rating} ({c.reviewCount} avaliacoes)
                  </span>
                </div>

                {/* Badges row: match + like + status */}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 bg-rose-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-md">
                    <Zap className="h-3 w-3" />
                    {c.matchPercent}%
                  </span>
                  {c.hasLiked && (
                    <span className="inline-flex items-center gap-1 bg-tc-green-text text-white text-xs font-medium px-2.5 py-0.5 rounded-md">
                      <Heart className="h-3 w-3 fill-white" />
                      Like
                    </span>
                  )}
                  <span className={`text-xs font-medium ${statusCfg.className}`}>
                    {statusCfg.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: dates sidebar */}
          <div className="shrink-0 border border-border rounded-md p-3 space-y-2 text-xs min-w-[160px]">
            <div>
              <span className="text-tc-text-hint">Data da Candidatura</span>
              <p className="flex items-center gap-1 text-tc-text-primary font-medium mt-0.5">
                <Calendar className="h-3 w-3" />
                {c.applicationDate}
              </p>
            </div>
            <div>
              <span className="text-tc-text-hint">Inicio Desejado</span>
              <p className="flex items-center gap-1 text-tc-text-primary font-medium mt-0.5">
                <Calendar className="h-3 w-3" />
                {c.desiredStartDate}
              </p>
            </div>
            <div>
              <span className="text-tc-text-hint">Duracao</span>
              <p className="flex items-center gap-1 text-tc-text-primary font-medium mt-0.5">
                <Clock className="h-3 w-3" />
                {c.duration}
              </p>
            </div>
          </div>
        </div>

        {/* ── Languages ── */}
        {c.languages.length > 0 && (
          <div>
            <span className="text-xs text-tc-text-hint">Idiomas</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {c.languages.map((lang) => (
                <span
                  key={lang}
                  className="text-xs font-medium text-tc-text-primary bg-muted px-2.5 py-1 rounded-md"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Skills ── */}
        {c.skills.length > 0 && (
          <div>
            <span className="text-xs text-tc-text-hint">Habilidades</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {c.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs font-medium text-tc-text-primary bg-muted px-2.5 py-1 rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Requirements: mandatory + optional ── */}
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {c.requiredSkills.length > 0 && (
            <div>
              <span className="flex items-center gap-1 text-xs font-medium text-tc-text-primary mb-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Requisitos Obrigatorios
              </span>
              <div className="flex flex-wrap gap-2">
                {c.requiredSkills.map((s) => (
                  <span
                    key={s.label}
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${
                      s.met
                        ? "bg-tc-green-bg text-tc-green-text border-tc-green-border"
                        : "bg-tc-red-bg text-tc-red-text border-tc-red-border"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {c.optionalSkills.length > 0 && (
            <div>
              <span className="flex items-center gap-1 text-xs font-medium text-tc-text-primary mb-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-tc-text-hint" />
                Opcionais
              </span>
              <div className="flex flex-wrap gap-2">
                {c.optionalSkills.map((s) => (
                  <span
                    key={s.label}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border border-border bg-white text-tc-text-secondary"
                  >
                    <Star className="h-3 w-3" />
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Message ── */}
        {c.message && (
          <div className="border border-border rounded-md p-3">
            <span className="flex items-center gap-1.5 text-xs text-tc-text-hint mb-1">
              <Mail className="h-3 w-3" />
              Mensagem do candidato
            </span>
            <p className="text-sm text-tc-text-secondary leading-relaxed">
              {c.message}
            </p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center justify-between pt-1">
          <Link
            to={`/anfitriao/oportunidades/${opportunityId}/candidatos/${c.id}`}
          >
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Eye className="h-3.5 w-3.5" />
              Ver Perfil Completo
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => onAccept?.(c.id)}
              disabled={c.status !== "pending"}
            >
              <Check className="h-3.5 w-3.5" />
              Aceitar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => onReject?.(c.id)}
              disabled={c.status !== "pending"}
            >
              <X className="h-3.5 w-3.5" />
              Rejeitar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

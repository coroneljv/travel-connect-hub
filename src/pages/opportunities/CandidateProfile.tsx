import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Mail,
  CheckCircle2,
  Briefcase,
  Star,
  Globe,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

/* ── Types ── */

interface Language {
  name: string;
  level: string;
  /** 0–100 for the progress bar */
  percent: number;
}

interface Experience {
  title: string;
  company: string;
  type: string;
  location: string;
  period: string;
  description: string;
}

interface CandidateProfileData {
  id: string;
  name: string;
  tagline: string;
  location: string;
  age: number;
  email: string;
  avatarUrl: string | null;
  coverUrl: string;
  isVerified: boolean;
  bio: string;
  experienceCount: number;
  rating: number;
  reviewCount: number;
  countryCount: number;
  languages: Language[];
  skills: string[];
  experiences: Experience[];
}

/* ── Mock data — TODO: substituir por query Supabase ── */

const MOCK_PROFILES: Record<string, CandidateProfileData> = {
  "cand-1": {
    id: "cand-1",
    name: "Emma Wilson",
    tagline: "Nomade Digital | Marketing & Hospitalidade | Apaixonada por Intercambio Cultural",
    location: "Londres, UK",
    age: 30,
    email: "emmawilson@email.com",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
    coverUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=300&fit=crop",
    isVerified: true,
    bio: "Sou uma viajante apaixonada por conhecer novas culturas e fazer conexoes autenticas ao redor do mundo. Com experiencia em marketing digital e hospitalidade, busco oportunidades que combinem trabalho significativo com desenvolvimento pessoal. Acredito que viajar e a melhor forma de aprendizado e estou sempre aberta a novos desafios e experiencias transformadoras.",
    experienceCount: 7,
    rating: 5,
    reviewCount: 24,
    countryCount: 12,
    languages: [
      { name: "Ingles", level: "Nativo", percent: 100 },
      { name: "Germanico", level: "Fluente", percent: 90 },
      { name: "Espanhol", level: "Avancado", percent: 75 },
      { name: "Portugues", level: "Intermediario", percent: 55 },
    ],
    skills: [
      "Marketing Digital",
      "Ensinar",
      "Atendimento ao Cliente",
      "Redes Sociais",
      "Fotografia",
      "Comunicacao",
      "Yoga",
      "Lideranca",
    ],
    experiences: [
      {
        title: "Social Media Manager",
        company: "Eco Lodge Brasil",
        type: "Intercambio",
        location: "Fernando de Noronha, Brasil",
        period: "dez. de 2023 - mai. de 2025",
        description:
          "Gerenciamento completo das redes sociais do eco lodge, criacao de conteudo, fotografia e estrategia de marketing digital. Aumento de 150% no engajamento.",
      },
      {
        title: "Recepcionista",
        company: "Sunset Hostel",
        type: "Voluntariado",
        location: "Barcelona, Espanha",
        period: "jun. de 2022 - nov. de 2023",
        description:
          "Recepcao de hospedes internacionais, gestao de reservas e organizacao de eventos sociais no hostel. Atendimento em 4 idiomas.",
      },
      {
        title: "Instrutora de Yoga",
        company: "Bali Retreat Center",
        type: "Intercambio",
        location: "Ubud, Bali",
        period: "jan. de 2022 - mai. de 2022",
        description:
          "Aulas diarias de yoga para hospedes do retiro, meditacao guiada e workshops de bem-estar.",
      },
    ],
  },
  "cand-2": {
    id: "cand-2",
    name: "Sarah Anderson",
    tagline: "Nomade Digital | Marketing & Hospitalidade | Apaixonada por Intercambio Cultural",
    location: "Sao Paulo, Brasil",
    age: 28,
    email: "sarahanderson@email.com",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop",
    coverUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&h=300&fit=crop",
    isVerified: true,
    bio: "Sou um viajante apaixonado por conhecer novas culturas e fazer conexoes autenticas ao redor do mundo. Com experiencia em marketing digital e hospitalidade, busco oportunidades que combinem trabalho significativo com desenvolvimento pessoal.",
    experienceCount: 7,
    rating: 4.9,
    reviewCount: 28,
    countryCount: 12,
    languages: [
      { name: "Portugues", level: "Nativo", percent: 100 },
      { name: "Ingles", level: "Fluente", percent: 90 },
      { name: "Espanhol", level: "Avancado", percent: 75 },
      { name: "Frances", level: "Intermediario", percent: 55 },
    ],
    skills: [
      "Marketing Digital",
      "Recepcao",
      "Atendimento ao Cliente",
      "Redes Sociais",
      "Fotografia",
      "Comunicacao",
    ],
    experiences: [
      {
        title: "Social Media Manager",
        company: "Eco Lodge Brasil",
        type: "Intercambio",
        location: "Fernando de Noronha, Brasil",
        period: "dez. de 2023 - mai. de 2025",
        description:
          "Gerenciamento completo das redes sociais do eco lodge, criacao de conteudo, fotografia e estrategia de marketing digital.",
      },
      {
        title: "Recepcionista",
        company: "Beach Hostel Rio",
        type: "Voluntariado",
        location: "Rio de Janeiro, Brasil",
        period: "mar. de 2023 - nov. de 2023",
        description:
          "Recepcao de hospedes internacionais, gestao de reservas e organizacao de eventos sociais.",
      },
    ],
  },
  "cand-3": {
    id: "cand-3",
    name: "Lucas Mendes",
    tagline: "Turismo | Surf | Multilingue | Amante da Natureza",
    location: "Florianopolis, Brasil",
    age: 25,
    email: "lucasmendes@email.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop",
    coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=300&fit=crop",
    isVerified: true,
    bio: "Apaixonado por surf e turismo sustentavel. Falo 3 idiomas e adoro trabalhar com pessoas de diferentes culturas. Busco experiencias que unam trabalho e estilo de vida.",
    experienceCount: 4,
    rating: 4.6,
    reviewCount: 8,
    countryCount: 6,
    languages: [
      { name: "Portugues", level: "Nativo", percent: 100 },
      { name: "Ingles", level: "Fluente", percent: 85 },
      { name: "Espanhol", level: "Avancado", percent: 70 },
    ],
    skills: [
      "Turismo",
      "Surf",
      "Atendimento",
      "Redes Sociais",
      "Fotografia",
    ],
    experiences: [
      {
        title: "Instrutor de Surf",
        company: "Praia Hostel",
        type: "Intercambio",
        location: "Florianopolis, Brasil",
        period: "jan. de 2024 - presente",
        description:
          "Aulas de surf para hospedes, organizacao de passeios e atividades aquaticas.",
      },
    ],
  },
};

const DEFAULT_PROFILE = MOCK_PROFILES["cand-2"]!;

/* ── Sub-components ── */

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-[180px] w-full rounded-lg" />
      <div className="flex items-end gap-4 -mt-10 px-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-16 rounded-md" />
        <Skeleton className="h-16 rounded-md" />
        <Skeleton className="h-16 rounded-md" />
      </div>
    </div>
  );
}

function LanguageBar({ lang }: { lang: Language }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-tc-text-primary min-w-[80px]">{lang.name}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-rose-500 rounded-full"
          style={{ width: `${lang.percent}%` }}
        />
      </div>
      <span className="text-xs text-tc-text-hint min-w-[90px] text-right">
        {lang.level}
      </span>
    </div>
  );
}

function ExperienceCard({ exp }: { exp: Experience }) {
  const typeBg =
    exp.type === "Intercambio"
      ? "bg-rose-50 text-rose-600 border-rose-200"
      : "bg-tc-green-bg text-tc-green-text border-tc-green-border";
  return (
    <div className="border-l-2 border-navy-500 pl-4 space-y-1">
      <h4 className="text-sm font-semibold text-tc-text-primary">
        {exp.title}
      </h4>
      <p className="text-xs text-tc-text-secondary">{exp.company}</p>
      <div className="flex items-center gap-2 flex-wrap text-xs text-tc-text-hint">
        <span
          className={`px-2 py-0.5 rounded-md border text-xs font-medium ${typeBg}`}
        >
          {exp.type}
        </span>
        <span className="flex items-center gap-0.5">
          <MapPin className="h-3 w-3" />
          {exp.location}
        </span>
        <span className="flex items-center gap-0.5">
          <Calendar className="h-3 w-3" />
          {exp.period}
        </span>
      </div>
      <p className="text-sm text-tc-text-secondary leading-relaxed pt-1">
        {exp.description}
      </p>
    </div>
  );
}

/* ── Page ── */

export default function CandidateProfile() {
  const { id, candidateId } = useParams<{ id: string; candidateId: string }>();
  const navigate = useNavigate();

  // TODO: substituir por useQuery + Supabase
  const isLoading = false;
  const profile = candidateId
    ? (MOCK_PROFILES[candidateId] ?? DEFAULT_PROFILE)
    : DEFAULT_PROFILE;

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleAccept = () => {
    // TODO: atualizar status via Supabase
    toast.success(`Candidatura de ${profile.name} aceita!`);
  };

  const handleReject = () => {
    // TODO: atualizar status via Supabase
    toast.error(`Candidatura de ${profile.name} rejeitada`);
  };

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          className="mt-1 text-tc-text-primary hover:text-navy-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-base font-medium text-tc-text-primary">
            Perfil do Candidato
          </h1>
          <p className="text-sm text-tc-text-hint">
            Analise completa do viajante
          </p>
        </div>
      </div>

      {/* ── Cover + Avatar card ── */}
      <Card className="overflow-hidden">
        <div className="relative">
          <img
            src={profile.coverUrl}
            alt="Cover"
            className="w-full h-[180px] object-cover"
          />
        </div>

        <CardContent className="px-6 pb-6">
          {/* Avatar row — overlaps cover */}
          <div className="flex items-end justify-between -mt-10">
            <div className="flex items-end gap-4">
              <Avatar className="h-20 w-20 border-4 border-white shadow-md">
                <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
                <AvatarFallback className="bg-navy-100 text-navy-700 text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="pb-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-lg font-semibold text-tc-text-primary">
                    {profile.name}
                  </h2>
                  {profile.isVerified && (
                    <CheckCircle2 className="h-4 w-4 text-navy-500 fill-navy-500" />
                  )}
                </div>
                <p className="text-xs text-tc-text-secondary max-w-md">
                  {profile.tagline}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0 mb-1"
              onClick={() => toast.info("Funcao de edicao em breve")}
            >
              <Mail className="h-3.5 w-3.5" />
              Editar
            </Button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-tc-text-hint">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {profile.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {profile.age} anos
            </span>
            <span className="flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {profile.email}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <Briefcase className="h-5 w-5 text-navy-500" />
            <div>
              <span className="text-lg font-bold text-tc-text-primary">
                {profile.experienceCount}
              </span>
              <span className="text-xs text-tc-text-hint ml-1">
                Experiencias
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <div>
              <span className="text-lg font-bold text-tc-text-primary">
                {profile.rating}
              </span>
              <span className="text-xs text-tc-text-hint ml-1">
                {profile.reviewCount} avaliacoes
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 px-5 flex items-center gap-3">
            <Globe className="h-5 w-5 text-navy-500" />
            <div>
              <span className="text-lg font-bold text-tc-text-primary">
                {profile.countryCount}
              </span>
              <span className="text-xs text-tc-text-hint ml-1">Paises</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 2-column: left (about + experiences) | right (languages + skills) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* About */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
                Sobre
              </h3>
              <p className="text-sm text-tc-text-secondary leading-relaxed">
                {profile.bio}
              </p>
            </CardContent>
          </Card>

          {/* Experiences */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-tc-text-primary mb-4">
                Experiencias
              </h3>
              <div className="space-y-5">
                {profile.experiences.map((exp, i) => (
                  <ExperienceCard key={i} exp={exp} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Languages */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-tc-text-primary mb-4">
                Idiomas
              </h3>
              <div className="space-y-3">
                {profile.languages.map((lang) => (
                  <LanguageBar key={lang.name} lang={lang} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
                Habilidades
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-medium text-tc-blue-text bg-tc-blue-bg px-2.5 py-1 rounded-pill"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="space-y-2">
            <Button
              className="w-full bg-navy-500 hover:bg-navy-600 text-white"
              onClick={handleAccept}
            >
              Aceitar Candidatura
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleReject}
            >
              Rejeitar Candidatura
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Users, Eye, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import CandidateCard from "@/components/shared/CandidateCard";
import EmptyState from "@/components/shared/EmptyState";
import type { Candidate } from "@/components/shared/CandidateCard";

/* ── Mock opportunity summary — TODO: substituir por query Supabase ── */

interface OpportunitySummary {
  title: string;
  destination: string;
  description: string;
  category: string;
  status: "open" | "closed";
  imageUrl: string;
  candidateCount: number;
  viewCount: number;
  duration: string;
}

const MOCK_SUMMARIES: Record<string, OpportunitySummary> = {
  "opp-1": {
    title: "Recepcionista de Hotel",
    destination: "Fernando de Noronha, Pernambuco",
    description: "Recepcao dos clientes e apoio nas demais funcoes",
    category: "Voluntariado",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
    candidateCount: 8,
    viewCount: 156,
    duration: "3 meses",
  },
  "opp-2": {
    title: "Gestor de redes sociais",
    destination: "Miami, Florida",
    description: "Gerir a presenca nas redes sociais e a criacao de conteudos",
    category: "Intercambio de trabalho",
    status: "closed",
    imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop",
    candidateCount: 12,
    viewCount: 203,
    duration: "6 meses",
  },
  "opp-3": {
    title: "Voluntariado no Eco Lodge",
    destination: "San Diego, California",
    description: "Ajuda nas operacoes diarias de um resort a beira-mar",
    category: "Voluntariado",
    status: "closed",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    candidateCount: 15,
    viewCount: 278,
    duration: "4 meses",
  },
  "opp-4": {
    title: "Instrutor de Surf",
    destination: "Florianopolis, SC",
    description: "Ensinar surf para hospedes iniciantes e intermediarios",
    category: "Intercambio de trabalho",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
    candidateCount: 8,
    viewCount: 145,
    duration: "3 meses",
  },
  "opp-5": {
    title: "Professor de Yoga",
    destination: "Ubud, Bali",
    description: "Aulas diarias de yoga para hospedes do retiro",
    category: "Voluntariado",
    status: "closed",
    imageUrl: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
    candidateCount: 20,
    viewCount: 312,
    duration: "2 meses",
  },
};

/* ── Mock candidates — TODO: substituir por query Supabase ── */

const MOCK_CANDIDATES: Record<string, Candidate[]> = {
  "opp-1": [
    {
      id: "cand-1",
      name: "Emma Wilson",
      age: 30,
      location: "UK",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
      rating: 5,
      reviewCount: 24,
      matchPercent: 75,
      hasLiked: true,
      status: "rejected",
      applicationDate: "10/12/2025",
      desiredStartDate: "10/01/2026",
      duration: "3 meses",
      languages: ["Germanico", "Ingles"],
      skills: ["Marketing Digital", "Ensinar", "Atendimento ao Cliente", "Redes Sociais"],
      requiredSkills: [
        { label: "Atendimento ao Cliente", met: true },
        { label: "Comunicacao", met: true },
      ],
      optionalSkills: [
        { label: "Redes Sociais", met: false },
        { label: "Fotografia", met: false },
        { label: "Experiencia Hotel", met: false },
      ],
      message:
        "Tenho uma vasta experiencia a trabalhar com animais e adoraria ajudar a cuidar das suas galinhas, cabras e abelhas. Tambem sou instrutora de ioga certificada.",
    },
    {
      id: "cand-2",
      name: "Sarah Anderson",
      age: 28,
      location: "Canada",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop",
      rating: 4.8,
      reviewCount: 12,
      matchPercent: 95,
      hasLiked: false,
      status: "pending",
      applicationDate: "10/12/2025",
      desiredStartDate: "15/01/2026",
      duration: "2 meses",
      languages: ["Ingles", "Frances"],
      skills: ["Recepcao", "Comunicacao", "Ingles Fluente"],
      requiredSkills: [
        { label: "Atendimento ao Cliente", met: true },
        { label: "Comunicacao", met: true },
      ],
      optionalSkills: [
        { label: "Redes Sociais", met: true },
        { label: "Fotografia", met: false },
      ],
      message:
        "Olá! Sou recepcionista há 3 anos e tenho paixão por viagens. Adoraria fazer parte da equipe do hotel em Fernando de Noronha!",
    },
    {
      id: "cand-3",
      name: "Lucas Mendes",
      age: 25,
      location: "Brasil",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop",
      rating: 4.6,
      reviewCount: 8,
      matchPercent: 88,
      hasLiked: true,
      status: "accepted",
      applicationDate: "08/12/2025",
      desiredStartDate: "05/01/2026",
      duration: "3 meses",
      languages: ["Portugues", "Ingles", "Espanhol"],
      skills: ["Turismo", "Atendimento", "Redes Sociais"],
      requiredSkills: [
        { label: "Atendimento ao Cliente", met: true },
        { label: "Comunicacao", met: true },
      ],
      optionalSkills: [
        { label: "Redes Sociais", met: true },
        { label: "Experiencia Hotel", met: true },
      ],
      message:
        "Trabalho com turismo há 2 anos e falo 3 idiomas. Seria incrível trabalhar em Noronha!",
    },
  ],
};

// Fallback for IDs without specific mock data
const DEFAULT_CANDIDATES: Candidate[] = MOCK_CANDIDATES["opp-1"] ?? [];

/* ── Page ── */

export default function HostCandidates() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // TODO: substituir por useQuery + Supabase
  const isLoading = false;
  const summary = id ? MOCK_SUMMARIES[id] ?? MOCK_SUMMARIES["opp-1"] : null;
  const candidates = id ? (MOCK_CANDIDATES[id] ?? DEFAULT_CANDIDATES) : [];

  const statusLabel = summary?.status === "open" ? "Aberto" : "Finalizado";
  const statusClass =
    summary?.status === "open"
      ? "bg-tc-green-bg text-tc-green-text border border-tc-green-border"
      : "bg-tc-red-bg text-tc-red-text border border-tc-red-border";

  const handleAccept = (candidateId: string) => {
    // TODO: atualizar status via Supabase
    toast.success(`Candidatura aceita: ${candidateId}`);
  };

  const handleReject = (candidateId: string) => {
    // TODO: atualizar status via Supabase
    toast.error(`Candidatura rejeitada: ${candidateId}`);
  };

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
            Candidaturas Recebidas
          </h1>
          <p className="text-sm text-tc-text-hint">
            {summary
              ? `${summary.title} - ${summary.destination}`
              : "Carregando..."}
          </p>
        </div>
      </div>

      {/* ── Opportunity summary card ── */}
      {isLoading ? (
        <div className="flex gap-4 border border-border rounded-lg p-4">
          <Skeleton className="w-56 h-28 rounded-md shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      ) : summary ? (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              <div className="relative sm:w-48 h-32 sm:h-auto shrink-0">
                <img
                  src={summary.imageUrl}
                  alt={summary.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 bg-navy-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-md">
                  {summary.category}
                </span>
              </div>
              <div className="flex-1 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-tc-text-primary">
                    {summary.title}
                  </h3>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-md ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="flex items-center gap-1 text-xs text-tc-text-secondary">
                  <MapPin className="h-3 w-3" />
                  {summary.destination}
                </p>
                <p className="text-xs text-tc-text-secondary line-clamp-1">
                  {summary.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-tc-text-hint">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {summary.candidateCount} candidatos
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {summary.viewCount} visualizacoes
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {summary.duration}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* ── Candidates list ── */}
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-4">
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-20 w-40 rounded-md" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-16 w-full rounded-md" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-36" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhuma candidatura recebida"
          description="Quando viajantes se candidatarem a esta oportunidade, eles aparecerão aqui"
        />
      ) : (
        <div className="space-y-4">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              opportunityId={id ?? ""}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

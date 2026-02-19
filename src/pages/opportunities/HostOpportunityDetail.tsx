import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OpportunityDetail } from "@/hooks/useOpportunityDetail";
import OpportunityDetailSections from "./OpportunityDetailSections";

/* ── Skeleton ── */

function HostDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="space-y-4 max-w-4xl">
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-[180px] rounded-md" />
          <Skeleton className="h-[180px] rounded-md" />
          <Skeleton className="h-[180px] rounded-md" />
        </div>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

/* ── Mock data — TODO: remover quando dados vierem do Supabase ── */

interface HostMockEntry {
  id: string;
  title: string;
  destination: string;
  description: string;
  category: string;
  imageUrl: string;
  status: "open" | "closed";
  candidateCount: number;
  viewCount: number;
  duration: string;
}

const MOCK_ENTRIES: HostMockEntry[] = [
  {
    id: "opp-1",
    title: "Recepcionista de Hotel",
    destination: "Fernando de Noronha, Pernambuco",
    description:
      "Venha fazer parte do nosso time no Beach Life Hotel! Estamos localizados a apenas 50 metros da praia, um dos destinos mais procurados do Brasil. Nosso hotel e conhecido pela atmosfera descontraida, hospedes internacionais e eventos sociais diarios. Buscamos uma pessoa comunicativa e responsavel para integrar nossa equipe de recepcao, ajudando a criar experiencias inesqueciveis para viajantes do mundo todo.",
    category: "Intercambio de trabalho",
    imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
    status: "open",
    candidateCount: 5,
    viewCount: 89,
    duration: "1 mes",
  },
  {
    id: "opp-2",
    title: "Gestor de redes sociais",
    destination: "Miami, Florida",
    description:
      "Gerir a presenca nas redes sociais e a criacao de conteudos para o nosso hostel em Miami Beach. Ideal para profissionais de marketing digital com experiencia em criacao de conteudo para Instagram e TikTok.",
    category: "Intercambio de trabalho",
    imageUrl: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop",
    status: "closed",
    candidateCount: 12,
    viewCount: 203,
    duration: "6 meses",
  },
  {
    id: "opp-3",
    title: "Voluntariado no Eco Lodge",
    destination: "San Diego, California",
    description:
      "Ajuda nas operacoes diarias de um resort a beira-mar. Atividades incluem jardinagem, recepcao de hospedes e organizacao de eventos comunitarios em um ambiente sustentavel.",
    category: "Voluntariado",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    status: "closed",
    candidateCount: 15,
    viewCount: 278,
    duration: "4 meses",
  },
  {
    id: "opp-4",
    title: "Instrutor de Surf",
    destination: "Florianopolis, SC",
    description:
      "Ensinar surf para hospedes iniciantes e intermediarios na Praia do Campeche. Procuramos alguem com paixao pelo esporte e habilidade de comunicacao em ingles e espanhol.",
    category: "Intercambio de trabalho",
    imageUrl: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
    status: "open",
    candidateCount: 8,
    viewCount: 145,
    duration: "3 meses",
  },
  {
    id: "opp-5",
    title: "Professor de Yoga",
    destination: "Ubud, Bali",
    description:
      "Aulas diarias de yoga para hospedes do retiro. Ambiente tranquilo cercado pela natureza, com alimentacao organica inclusa e acomodacao em bangalo privativo.",
    category: "Voluntariado",
    imageUrl: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
    status: "closed",
    candidateCount: 20,
    viewCount: 312,
    duration: "2 meses",
  },
];

const MOCK_IMAGE_SETS: Record<string, string[]> = {
  "opp-1": [
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop",
  ],
  "opp-2": [
    "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&h=400&fit=crop",
  ],
  "opp-3": [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1502680390548-bdbac40e4ce2?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=600&h=400&fit=crop",
  ],
  "opp-4": [
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&h=400&fit=crop",
  ],
  "opp-5": [
    "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1600618528240-fb9fc964b853?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1540202404-a2f29016b523?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=600&h=400&fit=crop",
  ],
};

const MOCK_RESPONSIBILITIES: Record<string, string[]> = {
  "opp-1": [
    "Recepcao e check-in/check-out de hospedes",
    "Auxiliar com informacoes sobre a regiao",
    "Manter a area de recepcao organizada",
    "Apoiar na gestao de reservas",
    "Participar de atividades comunitarias",
  ],
  "opp-2": [
    "Criar conteudo para Instagram e TikTok",
    "Gerenciar calendario de publicacoes",
    "Responder mensagens e comentarios",
    "Fotografar eventos e espacos do hostel",
  ],
  "opp-3": [
    "Auxiliar na manutencao do jardim organico",
    "Recepcionar hospedes no check-in",
    "Organizar eventos comunitarios semanais",
    "Apoiar na limpeza das areas comuns",
  ],
  "opp-4": [
    "Ministrar aulas de surf para iniciantes",
    "Garantir seguranca dos alunos na agua",
    "Cuidar do equipamento de surf",
    "Organizar passeios de surf guiados",
  ],
  "opp-5": [
    "Conduzir aulas de yoga matinais e vespertinas",
    "Preparar o espaco de pratica",
    "Oferecer meditacao guiada",
    "Apoiar no programa de bem-estar do retiro",
  ],
};

function buildMockDetail(entry: HostMockEntry): OpportunityDetail {
  return {
    id: entry.id,
    title: entry.title,
    destination: entry.destination,
    description: entry.description,
    start_date: null,
    end_date: null,
    budget_min: null,
    budget_max: null,
    status: entry.status,
    created_at: new Date().toISOString(),
    organizationName: "TravelConnect Host",
    hostName: "Luciane",
    hostAvatarUrl: null,
    images: MOCK_IMAGE_SETS[entry.id] ?? [entry.imageUrl],
    category: entry.category,
    rating: 4.9,
    reviewCount: 48,
    duration: entry.duration,
    matchPercent: 95,
    minMatchPercent: 75,
    isEligible: true,
    compensationType: "Quarto Privado \u2022 Cafe da manha",
    workHours: "25 horas/semana de trabalho",
    responsibilities: MOCK_RESPONSIBILITIES[entry.id] ?? [],
    skills: [],
    tipText: "",
    superLikeCredits: 0,
  };
}

/* ── Hook: mock IDs → mock data, real UUIDs → Supabase ── */

function useHostOpportunityDetail(id: string | undefined) {
  const isMockId = id?.startsWith("opp-") ?? false;

  return useQuery({
    queryKey: ["host-opportunity-detail", id],
    queryFn: async (): Promise<{ detail: OpportunityDetail; stats: { candidateCount: number; viewCount: number; publishedAgo: string; status: "open" | "closed" } } | null> => {
      if (!id) return null;

      // Mock path
      if (isMockId) {
        const entry = MOCK_ENTRIES.find((e) => e.id === id);
        if (!entry) return null;
        return {
          detail: buildMockDetail(entry),
          stats: {
            candidateCount: entry.candidateCount,
            viewCount: entry.viewCount,
            publishedAgo: entry.duration,
            status: entry.status,
          },
        };
      }

      // Real Supabase path — TODO: quando mock for removido, este é o caminho principal
      const { data, error } = await supabase
        .from("requests")
        .select(
          "*, organizations!requests_organization_id_fkey(name), profiles!requests_created_by_fkey(full_name, avatar_url)",
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Enrich with mock fields for now
      const detail: OpportunityDetail = {
        id: data.id,
        title: data.title,
        destination: data.destination,
        description: data.description,
        start_date: data.start_date,
        end_date: data.end_date,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        status: data.status,
        created_at: data.created_at,
        organizationName: (data as any).organizations?.name ?? "Desconhecido",
        hostName: (data as any).profiles?.full_name ?? "Anfitriao",
        hostAvatarUrl: (data as any).profiles?.avatar_url ?? null,
        images: [
          "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop",
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&h=400&fit=crop",
        ],
        category: "Voluntariado",
        rating: 4.9,
        reviewCount: 48,
        duration: "1 mes",
        matchPercent: 95,
        minMatchPercent: 75,
        isEligible: true,
        compensationType: "Quarto Privado \u2022 Cafe da manha",
        workHours: "25 horas/semana de trabalho",
        responsibilities: [
          "Recepcao e check-in/check-out de hospedes",
          "Auxiliar com informacoes sobre a regiao",
          "Manter a area de recepcao organizada",
        ],
        skills: [],
        tipText: "",
        superLikeCredits: 0,
      };

      return {
        detail,
        stats: {
          candidateCount: 5,
          viewCount: 89,
          publishedAgo: "1 mes",
          status: data.status === "open" ? "open" as const : "closed" as const,
        },
      };
    },
    enabled: !!id,
  });
}

/* ── Page ── */

export default function HostOpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } =
    useHostOpportunityDetail(id);

  const handleEdit = () => {
    // TODO: navegar para tela de edição
    toast.info("Funcionalidade de edicao em breve");
  };

  if (isLoading) return <HostDetailSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h2 className="text-xl font-semibold text-destructive">
          Erro ao carregar
        </h2>
        <p className="text-tc-text-hint">
          {(error as Error)?.message || "Tente novamente mais tarde."}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h2 className="text-xl font-semibold text-tc-text-primary">
          Oportunidade nao encontrada
        </h2>
        <p className="text-tc-text-hint">
          Esta oportunidade pode ter sido removida ou o link esta incorreto.
        </p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
      </div>
    );
  }

  const { detail, stats } = data;

  const statusLabel = stats.status === "open" ? "Aberto" : "Finalizado";
  const statusClass =
    stats.status === "open"
      ? "bg-tc-green-bg text-tc-green-text border border-tc-green-border"
      : "bg-tc-red-bg text-tc-red-text border border-tc-red-border";

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="mt-1 text-tc-text-primary hover:text-navy-500 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-medium text-tc-text-primary">
              Detalhes da Oportunidade
            </h1>
            <p className="text-sm text-tc-text-hint">
              Visualize e gerencie sua vaga
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleEdit}
          >
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
          <Link to={`/anfitriao/oportunidades/${id}/candidaturas`}>
            <Button
              size="sm"
              className="gap-1.5 bg-navy-500 hover:bg-navy-600 text-white"
            >
              <Users className="h-4 w-4" />
              Ver Candidaturas
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Status + Stats summary ── */}
      <Card>
        <CardContent className="py-4 px-5 flex flex-wrap items-center gap-4">
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-md ${statusClass}`}
          >
            {statusLabel}
          </span>
          <span className="text-sm text-tc-text-secondary">
            {stats.candidateCount} candidatos
          </span>
          <span className="text-sm text-tc-text-secondary">
            {stats.viewCount} visualizacoes
          </span>
          <span className="text-sm text-tc-text-hint">
            Publicado ha {stats.publishedAgo}
          </span>
        </CardContent>
      </Card>

      {/* ── Reuse viajante sections (gallery, badge, title, stats, about, responsibilities) ── */}
      <div className="max-w-4xl">
        <OpportunityDetailSections opportunity={detail} />
      </div>
    </div>
  );
}

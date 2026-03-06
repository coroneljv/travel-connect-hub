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

/* ── Hook: fetch real data from Supabase ── */

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
];

function useHostOpportunityDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["host-opportunity-detail", id],
    queryFn: async (): Promise<{ detail: OpportunityDetail; stats: { candidateCount: number; viewCount: number; publishedAgo: string; status: "open" | "closed" } } | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("requests")
        .select(
          "*, organizations!requests_organization_id_fkey(name, city, state), profiles!requests_created_by_fkey(full_name, avatar_url)",
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data) return null;

      // Count proposals for this request
      const { count: proposalCount } = await supabase
        .from("proposals")
        .select("*", { count: "exact", head: true })
        .eq("request_id", id)
        .is("deleted_at", null);

      // Images from photos column or fallback
      const images = data.photos && data.photos.length > 0
        ? data.photos
        : FALLBACK_IMAGES;

      // Category from opportunity_type
      const category = data.opportunity_type === "trabalho_pago"
        ? "Trabalho Pago"
        : data.opportunity_type === "voluntariado"
          ? "Voluntariado"
          : data.opportunity_type || "A combinar";

      // Duration from duration_min / duration_max
      let duration = "";
      if (data.duration_min && data.duration_max) {
        duration = `${data.duration_min} - ${data.duration_max}`;
      } else if (data.duration_min) {
        duration = data.duration_min;
      } else if (data.duration_max) {
        duration = data.duration_max;
      }

      // Compensation from accommodation_type + meals
      const compensationParts: string[] = [];
      if (data.accommodation_type) compensationParts.push(data.accommodation_type);
      if (data.meals && data.meals.length > 0) compensationParts.push(data.meals.join(" + "));
      const compensationType = compensationParts.length > 0
        ? compensationParts.join(" \u2022 ")
        : "A combinar";

      // Work hours
      let workHours = "";
      if (data.hours_per_day && data.days_per_week) {
        const weeklyHours = data.hours_per_day * data.days_per_week;
        workHours = `${weeklyHours} horas/semana (${data.hours_per_day}h/dia, ${data.days_per_week} dias/semana)`;
      } else if (data.hours_per_day) {
        workHours = `${data.hours_per_day} horas/dia`;
      }

      // Responsibilities from task_description
      const responsibilities: string[] = [];
      if (data.task_description) {
        const lines = data.task_description
          .split(/\n/)
          .map((l: string) => l.trim())
          .filter((l: string) => l.length > 0);
        responsibilities.push(...lines);
      }

      // Skills from required_skills
      const skills: string[] = data.required_skills || [];

      // Calculate publishedAgo
      const createdDate = new Date(data.created_at);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      let publishedAgo = "hoje";
      if (diffDays >= 30) {
        const months = Math.floor(diffDays / 30);
        publishedAgo = `${months} ${months === 1 ? "mes" : "meses"}`;
      } else if (diffDays > 0) {
        publishedAgo = `${diffDays} ${diffDays === 1 ? "dia" : "dias"}`;
      }

      const detail: OpportunityDetail = {
        id: data.id,
        title: data.title,
        destination: data.destination || "",
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
        images,
        category,
        rating: 0,
        reviewCount: 0,
        duration,
        matchPercent: 0,
        minMatchPercent: 0,
        isEligible: true,
        compensationType,
        workHours,
        responsibilities,
        skills,
        tipText: "",
        superLikeCredits: 0,
        houseRules: data.house_rules ?? null,
      };

      return {
        detail,
        stats: {
          candidateCount: proposalCount ?? 0,
          viewCount: 0,
          publishedAgo,
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

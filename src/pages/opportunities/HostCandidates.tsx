import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Users, Eye, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import CandidateCard from "@/components/shared/CandidateCard";
import EmptyState from "@/components/shared/EmptyState";
import type { Candidate } from "@/components/shared/CandidateCard";
import { supabase } from "@/integrations/supabase/client";

/* ── Types ── */

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

/* ── Page ── */

export default function HostCandidates() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<OpportunitySummary | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);

      // Fetch the opportunity/request
      const { data: request, error } = await supabase
        .from("requests")
        .select("*")
        .eq("id", id!)
        .single();

      if (error || !request) {
        setSummary(null);
        setCandidates([]);
        setIsLoading(false);
        return;
      }

      // Build duration
      let duration = "";
      if (request.duration_min && request.duration_max) {
        duration = `${request.duration_min} - ${request.duration_max}`;
      } else if (request.duration_min) {
        duration = request.duration_min;
      } else if (request.duration_max) {
        duration = request.duration_max;
      }

      // Category
      const category = request.opportunity_type === "trabalho_pago"
        ? "Trabalho Pago"
        : request.opportunity_type === "voluntariado"
          ? "Voluntariado"
          : request.opportunity_type || "Oportunidade";

      // Get first photo or fallback
      const imageUrl = request.photos && request.photos.length > 0
        ? request.photos[0]
        : "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop";

      // Count proposals for this request
      const { count: proposalCount } = await supabase
        .from("proposals")
        .select("*", { count: "exact", head: true })
        .eq("request_id", id!)
        .is("deleted_at", null);

      setSummary({
        title: request.title,
        destination: request.destination ?? "",
        description: request.description ?? "",
        category,
        status: request.status === "open" ? "open" : "closed",
        imageUrl,
        candidateCount: proposalCount ?? 0,
        viewCount: 0,
        duration,
      });

      // No proposals/applications table with full candidate data yet - show empty
      setCandidates([]);
      setIsLoading(false);
    }

    fetchData();
  }, [id]);

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

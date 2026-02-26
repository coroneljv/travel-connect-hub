import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import HostOpportunityCard from "@/components/shared/HostOpportunityCard";
import EmptyState from "@/components/shared/EmptyState";
import type { HostOpportunity } from "@/components/shared/HostOpportunityCard";

/* ── Fallback images for opportunities without photos ── */
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
];

/** Map a Supabase request row to the HostOpportunity shape */
function mapToHostOpportunity(row: any, index: number): HostOpportunity {
  const status: "open" | "closed" = row.status === "open" ? "open" : "closed";
  const duration = row.duration_min
    ? row.duration_max ? `${row.duration_min} - ${row.duration_max}` : row.duration_min
    : "";
  return {
    id: row.id,
    title: row.title,
    destination: row.destination ?? "",
    description: row.description,
    category: row.opportunity_type ?? "Oportunidade",
    imageUrl: row.photos?.[0] ?? FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    status,
    candidateCount: 0, // TODO: count from proposals table
    viewCount: 0,      // TODO: implement view tracking
    duration,
  };
}

type TabKey = "all" | "open" | "closed";

const TABS: { key: TabKey; label: (count: number) => string }[] = [
  { key: "all", label: (n) => `Todas (${n})` },
  { key: "open", label: (n) => `Ativas (${n})` },
  { key: "closed", label: (n) => `Finalizadas (${n})` },
];

/* ── Page ── */

export default function HostOpportunities() {
  const { organization } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [rawOpportunities, setRawOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (organization?.id) {
      fetchMyOpportunities();
    } else {
      setIsLoading(false);
    }
  }, [organization?.id]);

  const fetchMyOpportunities = async () => {
    if (!organization?.id) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .eq("organization_id", organization.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRawOpportunities(data);
    }
    setIsLoading(false);
  };

  const opportunities: HostOpportunity[] = rawOpportunities.map(mapToHostOpportunity);

  /* ── Filtering ── */
  const searchLower = search.toLowerCase();
  const searchFiltered = opportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(searchLower) ||
      (opp.destination ?? "").toLowerCase().includes(searchLower),
  );

  const tabFiltered =
    activeTab === "all"
      ? searchFiltered
      : searchFiltered.filter((opp) => opp.status === activeTab);

  /* ── Tab counts (always based on search, not tab) ── */
  const allCount = searchFiltered.length;
  const openCount = searchFiltered.filter((o) => o.status === "open").length;
  const closedCount = searchFiltered.filter((o) => o.status === "closed").length;
  const tabCounts: Record<TabKey, number> = {
    all: allCount,
    open: openCount,
    closed: closedCount,
  };

  /* ── Handlers ── */
  const handleEdit = (id: string) => {
    // TODO: navegar para tela de edição
    toast.info(`Editar oportunidade ${id}`);
  };

  const handleDelete = (id: string) => {
    // TODO: confirmar e deletar via Supabase
    toast.error(`Excluir oportunidade ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-tc-text-primary">
            Minhas Oportunidades
          </h1>
          <p className="text-sm text-tc-text-hint">
            Gerencie todas as suas oportunidades
          </p>
        </div>
        <Link to="/requests/new">
          <Button className="bg-navy-500 hover:bg-navy-600 text-white gap-1.5">
            <Plus className="h-4 w-4" />
            Nova Oportunidade
          </Button>
        </Link>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="flex-1 flex items-center gap-2 bg-white border border-border rounded-md px-4 py-2.5">
          <Search className="h-4 w-4 text-tc-text-hint shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo ou localizacao..."
            className="flex-1 bg-transparent text-sm text-tc-text-primary placeholder:text-tc-text-placeholder outline-none"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-tc-text-secondary border-border hover:bg-muted"
                }`}
              >
                {tab.label(tabCounts[tab.key])}
              </button>
            );
          })}
        </div>
      </div>

      {/* Opportunities list */}
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-4 border border-border rounded-lg p-4">
              <Skeleton className="w-56 h-36 rounded-md shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-full max-w-sm" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tabFiltered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Nenhuma oportunidade encontrada"
          description={
            search
              ? "Tente buscar com outros termos"
              : "Crie sua primeira oportunidade para comecar a receber candidatos"
          }
          actionLabel="Criar Oportunidade"
          actionHref="/requests/new"
        />
      ) : (
        <div className="space-y-4">
          {tabFiltered.map((opp) => (
            <HostOpportunityCard
              key={opp.id}
              opportunity={opp}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

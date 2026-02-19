import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import HostOpportunityCard from "@/components/shared/HostOpportunityCard";
import EmptyState from "@/components/shared/EmptyState";
import type { HostOpportunity } from "@/components/shared/HostOpportunityCard";

/* ── Mock data — TODO: substituir por query Supabase ── */

const MOCK_OPPORTUNITIES: HostOpportunity[] = [
  {
    id: "opp-1",
    title: "Recepcionista de Hotel",
    destination: "Fernando de Noronha, Pernambuco",
    description: "Gestao da recepcao e servicos aos hospedes.",
    category: "Intercambio de trabalho",
    imageUrl:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
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
      "Gerir a presenca nas redes sociais e a criacao de conteudos",
    category: "Intercambio de trabalho",
    imageUrl:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop",
    status: "closed",
    candidateCount: 12,
    viewCount: 203,
    duration: "6 meses",
  },
  {
    id: "opp-3",
    title: "Voluntariado no Eco Lodge",
    destination: "San Diego, California",
    description: "Ajuda nas operacoes diarias de um resort a beira-mar",
    category: "Voluntariado",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
    status: "closed",
    candidateCount: 15,
    viewCount: 278,
    duration: "4 meses",
  },
  {
    id: "opp-4",
    title: "Instrutor de Surf",
    destination: "Florianopolis, SC",
    description: "Ensinar surf para hospedes iniciantes e intermediarios",
    category: "Intercambio de trabalho",
    imageUrl:
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
    status: "open",
    candidateCount: 8,
    viewCount: 145,
    duration: "3 meses",
  },
  {
    id: "opp-5",
    title: "Professor de Yoga",
    destination: "Ubud, Bali",
    description: "Aulas diarias de yoga para hospedes do retiro",
    category: "Voluntariado",
    imageUrl:
      "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
    status: "closed",
    candidateCount: 20,
    viewCount: 312,
    duration: "2 meses",
  },
];

type TabKey = "all" | "open" | "closed";

const TABS: { key: TabKey; label: (count: number) => string }[] = [
  { key: "all", label: (n) => `Todas (${n})` },
  { key: "open", label: (n) => `Ativas (${n})` },
  { key: "closed", label: (n) => `Finalizadas (${n})` },
];

/* ── Page ── */

export default function HostOpportunities() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  // TODO: substituir por useQuery + Supabase
  const isLoading = false;
  const opportunities = MOCK_OPPORTUNITIES;

  /* ── Filtering ── */
  const searchFiltered = opportunities.filter(
    (opp) =>
      opp.title.toLowerCase().includes(search.toLowerCase()) ||
      opp.destination.toLowerCase().includes(search.toLowerCase()),
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

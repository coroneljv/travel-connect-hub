import { useState } from "react";
import {
  Globe,
  SmilePlus,
  Briefcase,
  Heart,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import OpportunityCard from "./opportunities/OpportunityCard";
import OpportunityFilters from "./opportunities/OpportunityFilters";

// TODO: mock enrichments — substituir por dados reais do DB
const MOCK_IMAGES = [
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
];

// TODO: substituir por coluna requests.category quando existir
const MOCK_CATEGORY: Record<number, "volunteer" | "exchange"> = {
  0: "volunteer", // Recepcionista
  1: "volunteer", // Auxiliar Cozinha
  2: "exchange",  // Guia Turismo
  3: "exchange",  // Social Media
  4: "volunteer", // Professor Yoga
};

const MOCK_TAGS_MAP: Record<number, string[]> = {
  0: ["Recepcao", "Comunicacao", "Ingles"],
  1: ["Cozinha", "Sustentabilidade"],
  2: ["Turismo", "Surf", "Ingles"],
  3: ["Marketing Digital", "Fotografia"],
  4: ["Yoga", "Meditacao", "Ingles"],
};
const MOCK_MATCH = [95, 92, 90, 88, 85];
const MOCK_RATING = [4.9, 4.8, 4.7, 4.5, 4.8];
const MOCK_DURATION = ["1 mes", "3 meses", "3 meses", "3 meses", "2 meses"];
const MOCK_COMPENSATION = [
  "Hospedagem + Refeicao",
  "Hospedagem + Refeicao",
  "Hospedagem + Cafe",
  "Hospedagem",
  "Hospedagem + Refeicao completa",
];

const TABS = [
  { key: "all", label: "Oportunidades", icon: Globe },
  { key: "volunteer", label: "Voluntariado", icon: SmilePlus },
  { key: "exchange", label: "Intercambio", icon: Briefcase },
  { key: "favorites", label: "Favoritos", icon: Heart },
] as const;

// TODO: persistir favoritos no DB ou localStorage
const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  all: {
    title: "Recomendados para Voce",
    subtitle: "Oportunidades com maior compatibilidade com seu perfil",
  },
  volunteer: {
    title: "Voluntariado",
    subtitle: "Oportunidades de trabalho voluntario em troca de hospedagem",
  },
  exchange: {
    title: "Intercambio",
    subtitle: "Programas de intercambio cultural e profissional",
  },
  favorites: {
    title: "Seus Favoritos",
    subtitle: "Oportunidades que voce salvou",
  },
};

const Opportunities = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  // TODO: persistir favoritos no DB
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities", search],
    queryFn: async () => {
      let query = supabase
        .from("requests")
        .select("*, organizations!requests_organization_id_fkey(name)")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,destination.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filter opportunities by active tab
  const filtered = opportunities.filter((_opp: any, i: number) => {
    if (activeTab === "all") return true;
    if (activeTab === "favorites") return favoriteIds.has(_opp.id);
    return MOCK_CATEGORY[i % 5] === activeTab;
  });

  const section = SECTION_TITLES[activeTab] ?? SECTION_TITLES.all;

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex rounded-pill overflow-hidden border border-rose-500">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 px-4 text-lg transition-colors ${
                isActive
                  ? "bg-rose-500 text-white"
                  : "bg-white text-tc-text-placeholder hover:bg-muted"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 items-stretch">
        <div className="flex-1 flex items-center bg-white border border-border rounded-md px-4 py-3 gap-3">
          <div className="flex-1">
            <p className="text-xs text-tc-text-primary">Onde</p>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar destinos"
              className="w-full bg-transparent text-base text-tc-text-secondary placeholder:text-tc-text-secondary outline-none"
            />
          </div>
          <div className="w-px h-[39px] bg-border" />
          <div className="flex-1">
            <p className="text-xs text-tc-text-primary">Quando</p>
            <p className="text-base text-tc-text-secondary">Adicione Datas</p>
          </div>
          <button className="shrink-0 bg-rose-500 rounded-full p-2.5 shadow-md hover:bg-rose-600 transition-colors">
            <Search className="h-4 w-4 text-white" />
          </button>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2.5 px-6 bg-white border border-border rounded-md text-base text-tc-text-secondary hover:bg-muted transition-colors"
        >
          <SlidersHorizontal className="h-5 w-5" />
          Filtros
        </button>
      </div>

      {/* Advanced Filters */}
      <OpportunityFilters
        open={showFilters}
        onClose={() => setShowFilters(false)}
      />

      {/* Results Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-navy-500" />
          <div>
            <p className="text-base font-medium text-tc-text-primary">
              {section.title}
            </p>
            <p className="text-sm text-tc-text-hint">{section.subtitle}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-[220px] rounded-md" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-border rounded-md py-16 text-center text-tc-text-hint">
            {activeTab === "favorites"
              ? "Voce ainda nao favoritou nenhuma oportunidade. Clique no coracao para salvar!"
              : "Nenhuma oportunidade encontrada."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((opp: any, i: number) => {
              const origIdx = opportunities.indexOf(opp);
              return (
                <OpportunityCard
                  key={opp.id}
                  id={opp.id}
                  title={opp.title}
                  destination={opp.destination}
                  description={opp.description}
                  start_date={opp.start_date}
                  end_date={opp.end_date}
                  imageUrl={MOCK_IMAGES[origIdx % MOCK_IMAGES.length]}
                  matchPercent={MOCK_MATCH[origIdx % MOCK_MATCH.length]}
                  rating={MOCK_RATING[origIdx % MOCK_RATING.length]}
                  duration={MOCK_DURATION[origIdx % MOCK_DURATION.length]}
                  compensationLabel={
                    MOCK_COMPENSATION[origIdx % MOCK_COMPENSATION.length]
                  }
                  tags={MOCK_TAGS_MAP[origIdx % 5] ?? []}
                  isFavorite={favoriteIds.has(opp.id)}
                  onToggleFavorite={() => toggleFavorite(opp.id)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunities;

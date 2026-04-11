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
import { useTranslation } from "react-i18next";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1545389336-cf090694435e?w=600&h=400&fit=crop",
];

const Opportunities = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  const TABS = [
    { key: "all", label: t("opportunities.tabs.recommended"), icon: Globe },
    { key: "volunteer", label: t("opportunities.tabs.volunteering"), icon: SmilePlus },
    { key: "exchange", label: t("opportunities.tabs.exchange"), icon: Briefcase },
    { key: "favorites", label: t("opportunities.tabs.favorites"), icon: Heart },
  ];

  const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
    all: {
      title: t("opportunities.tabs.recommended"),
      subtitle: t("opportunities.tabDescriptions.recommended"),
    },
    volunteer: {
      title: t("opportunities.tabs.volunteering"),
      subtitle: t("opportunities.tabDescriptions.volunteering"),
    },
    exchange: {
      title: t("opportunities.tabs.exchange"),
      subtitle: t("opportunities.tabDescriptions.exchange"),
    },
    favorites: {
      title: t("opportunities.tabs.favorites"),
      subtitle: t("opportunities.tabDescriptions.favorites"),
    },
  };

  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities", search],
    queryFn: async () => {
      let query = supabase
        .from("requests")
        .select("*, organizations!requests_organization_id_fkey(name, logo_url, city, state, country)")
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

  const filtered = opportunities.filter((opp: any) => {
    if (activeTab === "all") return true;
    if (activeTab === "favorites") return favoriteIds.has(opp.id);
    const type = opp.opportunity_type?.toLowerCase() ?? "";
    if (activeTab === "volunteer") return type.includes("voluntar");
    if (activeTab === "exchange") return type.includes("intercambio") || type.includes("trabalho") || type.includes("exchange");
    return true;
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
            <p className="text-xs text-tc-text-primary">{t("opportunities.where")}</p>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("opportunities.wherePlaceholder")}
              className="w-full bg-transparent text-base text-tc-text-secondary placeholder:text-tc-text-secondary outline-none"
            />
          </div>
          <div className="w-px h-[39px] bg-border" />
          <div className="flex-1">
            <p className="text-xs text-tc-text-primary">{t("opportunities.when")}</p>
            <p className="text-base text-tc-text-secondary">{t("opportunities.addDates")}</p>
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
          {t("common.filters")}
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
              ? t("opportunities.noFavorites")
              : t("opportunities.noResults")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((opp: any, i: number) => {
              const imageUrl = opp.photos?.[0] ?? FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
              const orgData = opp.organizations;
              const location = orgData?.city && orgData?.state
                ? `${orgData.city}, ${orgData.state}`
                : opp.destination ?? orgData?.name ?? "";
              const compensationParts: string[] = [];
              if (opp.accommodation_type) compensationParts.push(opp.accommodation_type);
              if (opp.meals?.length) compensationParts.push(opp.meals.join(" + "));
              const compensationLabel = compensationParts.length > 0
                ? compensationParts.join(" + ")
                : "A combinar";
              const duration = opp.duration_min
                ? opp.duration_max ? `${opp.duration_min} - ${opp.duration_max}` : opp.duration_min
                : "";
              const tags: string[] = opp.required_skills ?? [];
              return (
                <OpportunityCard
                  key={opp.id}
                  id={opp.id}
                  title={opp.title}
                  destination={location}
                  description={opp.description}
                  start_date={opp.start_date}
                  end_date={opp.end_date}
                  imageUrl={imageUrl}
                  matchPercent={0}
                  rating={0}
                  duration={duration}
                  compensationLabel={compensationLabel}
                  tags={tags}
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

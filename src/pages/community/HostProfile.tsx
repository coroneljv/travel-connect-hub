import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  Share2,
  MessageCircle,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Briefcase,
  Globe,
  Home,
  ThumbsUp,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabId = "sobre" | "oportunidades" | "publicacoes" | "avaliacoes";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StarsRow({
  rating,
  size = "h-4 w-4",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${size} ${
            s <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab Content: Sobre
// ---------------------------------------------------------------------------

function TabSobre({ org }: { org: any }) {
  return (
    <div className="space-y-6">
      {/* Sobre Nos */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-base font-bold text-tc-text-primary mb-3">
          Sobre Nos
        </h3>
        <p className="text-sm text-tc-text-secondary leading-relaxed">
          {org.description || "Nenhuma descricao cadastrada"}
        </p>
      </div>

      {/* Informacoes */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-base font-bold text-tc-text-primary mb-4">
          Informacoes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Home className="h-4 w-4 text-tc-text-hint flex-shrink-0" />
            <div>
              <p className="text-xs text-tc-text-hint">Tipo</p>
              <p className="text-sm font-medium text-tc-text-primary">
                {org.host_type || "Nao informado"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-tc-text-hint flex-shrink-0" />
            <div>
              <p className="text-xs text-tc-text-hint">Idiomas</p>
              <p className="text-sm font-medium text-tc-text-primary">
                Nenhum dado cadastrado
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-tc-text-hint flex-shrink-0" />
            <div>
              <p className="text-xs text-tc-text-hint">Capacidade</p>
              <p className="text-sm font-medium text-tc-text-primary">
                Nenhum dado cadastrado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab Content: Oportunidades
// ---------------------------------------------------------------------------

function TabOportunidades({ orgId }: { orgId: string }) {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpportunities() {
      setLoading(true);
      const { data, error } = await supabase
        .from("requests")
        .select("id, title, destination, opportunity_type, photos, required_skills, duration_min, duration_max, status")
        .eq("organization_id", orgId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOpportunities(data);
      }
      setLoading(false);
    }
    fetchOpportunities();
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-tc-text-hint text-sm">Nenhuma oportunidade publicada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {opportunities.map((opp) => {
        const imageUrl = opp.photos && opp.photos.length > 0
          ? opp.photos[0]
          : null;
        const duration = opp.duration_min && opp.duration_max
          ? `${opp.duration_min} - ${opp.duration_max}`
          : opp.duration_min || opp.duration_max || "";
        const skills: string[] = opp.required_skills || [];

        return (
          <div
            key={opp.id}
            className="rounded-xl overflow-hidden border border-border bg-white"
          >
            {/* Image */}
            <div className="relative aspect-video bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={opp.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Briefcase className="h-12 w-12 text-navy-300" />
              )}
              {/* Status badge */}
              <span className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                opp.status === "open" ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"
              }`}>
                {opp.status === "open" ? "Aberto" : "Finalizado"}
              </span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <h4 className="text-sm font-bold text-tc-text-primary">
                {opp.title}
              </h4>

              {duration && (
                <div className="flex items-center gap-1.5 text-xs text-tc-text-hint">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{duration}</span>
                </div>
              )}

              {/* Skills */}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-warm-gray text-tc-text-secondary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="w-full py-2 text-sm font-medium text-tc-text-primary border border-border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab Content: Publicacoes
// ---------------------------------------------------------------------------

function TabPublicacoes() {
  return (
    <div className="text-center py-12">
      <p className="text-tc-text-hint text-sm">Nenhuma publicacao encontrada</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab Content: Avaliacoes
// ---------------------------------------------------------------------------

function TabAvaliacoes() {
  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Left: big number */}
          <div className="flex flex-col items-center justify-center sm:min-w-[140px]">
            <p className="text-5xl font-bold text-tc-text-primary">--</p>
            <StarsRow rating={0} size="h-5 w-5" />
            <p className="text-xs text-tc-text-hint mt-1">0 avaliacoes</p>
          </div>

          {/* Right: rating bars */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-xs text-tc-text-secondary w-6 text-right">
                  {stars}
                </span>
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: "0%" }}
                  />
                </div>
                <span className="text-xs text-tc-text-hint w-8">0%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-tc-text-hint text-sm">Nenhuma avaliacao encontrada</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const TABS: { id: TabId; label: string }[] = [
  { id: "sobre", label: "Sobre" },
  { id: "oportunidades", label: "Oportunidades" },
  { id: "publicacoes", label: "Publicacoes" },
  { id: "avaliacoes", label: "Avaliacoes" },
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function HostProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>("sobre");
  const [isFollowing, setIsFollowing] = useState(false);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (!error && data) {
        setOrg(data);
      }
      setLoading(false);
    };
    fetchOrg();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-gray flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        <span className="ml-3 text-tc-text-hint">Carregando perfil...</span>
      </div>
    );
  }

  // Not found
  if (!org) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-sm text-tc-text-secondary hover:text-tc-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-lg font-semibold text-tc-text-primary">Perfil nao encontrado</p>
          <p className="text-sm text-tc-text-hint mt-2">O anfitriao solicitado nao existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  const location = [org.city, org.state].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-warm-gray">
      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-tc-text-secondary hover:text-tc-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>

      {/* Cover photo */}
      <div className="mt-3">
        <div className="w-full h-48 bg-gradient-to-r from-navy-200 via-navy-100 to-rose-100" />
      </div>

      {/* Profile card */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <div className="border border-border rounded-xl bg-white p-6">
          {/* Top row: avatar + info + actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Avatar */}
            <div className="relative -mt-16 flex-shrink-0">
              {org.logo_url ? (
                <img
                  src={org.logo_url}
                  alt={org.name}
                  className="w-20 h-20 rounded-xl border-4 border-white object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl border-4 border-white bg-navy-100 flex items-center justify-center text-navy-500 text-2xl font-bold">
                  {org.name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-tc-text-primary truncate">
                {org.name}
              </h1>

              {location && (
                <div className="flex items-center gap-1 mt-1 text-sm text-rose-500">
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-start gap-2 flex-shrink-0">
              <button
                type="button"
                className="p-2.5 border border-border rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Compartilhar"
              >
                <Share2 className="h-4 w-4 text-tc-text-secondary" />
              </button>
              <button
                type="button"
                className="p-2.5 border border-border rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Enviar mensagem"
              >
                <MessageCircle className="h-4 w-4 text-tc-text-secondary" />
              </button>
            </div>
          </div>

          {/* Follow button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setIsFollowing((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-colors ${
                isFollowing
                  ? "bg-navy-500 text-white hover:bg-navy-600"
                  : "border border-navy-500 text-navy-500 hover:bg-navy-50"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${isFollowing ? "fill-white" : ""}`}
              />
              {isFollowing ? "Seguindo" : "Seguir"}
            </button>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 border-t border-border mt-4 pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-rose-500" />
              <div>
                <span className="text-sm font-bold text-tc-text-primary">0</span>
                <span className="text-xs text-tc-text-hint ml-1">
                  Viajantes Hospedados
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <div>
                <span className="text-sm font-bold text-tc-text-primary">--</span>
                <span className="text-xs text-tc-text-hint ml-1">
                  Avaliacao
                </span>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 mt-4 border-t border-border pt-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-navy-500 text-white"
                    : "bg-white text-tc-text-secondary hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "sobre" && <TabSobre org={org} />}
        {activeTab === "oportunidades" && <TabOportunidades orgId={org.id} />}
        {activeTab === "publicacoes" && <TabPublicacoes />}
        {activeTab === "avaliacoes" && <TabAvaliacoes />}
      </div>
    </div>
  );
}

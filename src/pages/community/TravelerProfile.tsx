import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Star,
  Heart,
  Share2,
  MessageCircle,
  Briefcase,
  Languages,
  CheckCircle2,
  Camera,
  Globe,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabKey = "sobre" | "experiencias" | "publicacoes" | "avaliacoes";

// ---------------------------------------------------------------------------
// Sub-components
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
// Main Component
// ---------------------------------------------------------------------------

export default function TravelerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("sobre");
  const [isFollowing, setIsFollowing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
    checkIfFollowing();
  }, [id]);

  const checkIfFollowing = async () => {
    if (!user || !id) return;
    const { data } = await (supabase.from("user_follows" as any) as any)
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", id)
      .maybeSingle();
    if (data) setIsFollowing(true);
  };

  const handleFollow = async () => {
    if (!user || !id) return;
    if (isFollowing) {
      await (supabase.from("user_follows" as any) as any)
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", id);
      setIsFollowing(false);
      toast.success("Deixou de seguir");
    } else {
      await (supabase.from("user_follows" as any) as any)
        .insert({ follower_id: user.id, following_id: id });
      setIsFollowing(true);
      toast.success("Seguindo!");
    }
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: "sobre", label: "Sobre" },
    { key: "experiencias", label: "Experiências" },
    { key: "publicacoes", label: "Publicações" },
    { key: "avaliacoes", label: "Avaliações" },
  ];

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-warm-gray flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        <span className="ml-3 text-tc-text-hint">Carregando perfil...</span>
      </div>
    );
  }

  // ── Not found ──
  if (!profile) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-tc-text-secondary hover:text-navy-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-lg font-semibold text-tc-text-primary">Perfil não encontrado</p>
          <p className="text-sm text-tc-text-hint mt-2">O viajante solicitado não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  // ── Tab: Sobre ──

  const renderSobreTab = () => (
    <div className="space-y-6">
      {/* Sobre Mim */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
          Sobre Mim
        </h3>
        <p className="text-sm text-tc-text-secondary leading-relaxed">
          {profile.bio || "Nenhum dado cadastrado"}
        </p>
      </div>

      {/* Idiomas */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
          Idiomas
        </h3>
        {profile.languages?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang: string) => (
              <span key={lang} className="px-3 py-1.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-100">
                {lang}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-tc-text-hint">Nenhum dado cadastrado</p>
        )}
      </div>

      {/* Habilidades */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
          Habilidades
        </h3>
        {profile.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string) => (
              <span key={skill} className="px-3 py-1.5 rounded-full text-xs font-medium bg-navy-50 text-navy-600 border border-navy-100">
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-tc-text-hint">Nenhum dado cadastrado</p>
        )}
      </div>

      {/* Regiões de Interesse */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
          Regiões de Interesse
        </h3>
        {profile.regions?.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.regions.map((region: string) => (
              <span key={region} className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                {region}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-tc-text-hint">Nenhum dado cadastrado</p>
        )}
      </div>

      {/* Duração Preferida */}
      {profile.preferred_duration && (
        <div className="border border-border rounded-xl p-6 bg-white">
          <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
            Duração Preferida
          </h3>
          <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100">
            {profile.preferred_duration}
          </span>
        </div>
      )}

      {/* Preferências Adicionais */}
      {profile.additional_preferences && (
        <div className="border border-border rounded-xl p-6 bg-white">
          <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
            Preferências Adicionais
          </h3>
          <p className="text-sm text-tc-text-secondary leading-relaxed">
            {profile.additional_preferences}
          </p>
        </div>
      )}
    </div>
  );

  // ── Tab: Experiências ──

  const renderExperienciasTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-tc-text-primary">
            Certificados de Oportunidades
          </h3>
          <p className="text-sm text-tc-text-hint mt-1">
            Experiências completadas através da plataforma ao redor do mundo
          </p>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-sm text-tc-text-hint">Nenhuma experiência registrada</p>
      </div>
    </div>
  );

  // ── Tab: Publicações ──

  const renderPublicacoesTab = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <p className="text-sm text-tc-text-hint">Nenhuma publicação encontrada</p>
      </div>
    </div>
  );

  // ── Tab: Avaliações ──

  const renderAvaliacoesTab = () => (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <div className="flex items-start gap-8">
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl font-bold text-tc-text-primary">
              --
            </span>
            <StarsRow rating={0} size="h-5 w-5" />
            <span className="text-xs text-tc-text-hint mt-1">
              0 avaliações
            </span>
          </div>

          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-xs text-tc-text-secondary w-4 text-right">
                  {stars}
                </span>
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: "0%" }}
                  />
                </div>
                <span className="text-xs text-tc-text-hint w-8 text-right">
                  0%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center py-12">
        <p className="text-sm text-tc-text-hint">Nenhuma avaliação encontrada</p>
      </div>
    </div>
  );

  // ── Main render ──

  return (
    <div className="min-h-screen bg-warm-gray">
      {/* Back link */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-tc-text-secondary hover:text-navy-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>

      {/* Cover photo */}
      <div className="mt-3">
        <div className="w-full h-48 bg-gradient-to-r from-rose-200 via-rose-100 to-navy-100" />
      </div>

      {/* Profile card */}
      <div className="border border-border rounded-xl bg-white p-6 mx-auto max-w-4xl -mt-16 relative z-10">
        {/* Top row: avatar + info + action buttons */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar with online indicator */}
            <div className="relative -mt-16">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-20 h-20 rounded-xl border-4 border-white object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl border-4 border-white bg-rose-100 flex items-center justify-center text-rose-500 text-2xl font-bold">
                  {profile.full_name?.[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-semibold text-tc-text-primary">
                  {profile.full_name}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-tc-text-secondary">
                {profile.nationality && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {profile.nationality}
                  </span>
                )}
                {profile.date_of_birth && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date().getFullYear() - new Date(profile.date_of_birth).getFullYear()} anos
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={async () => {
                const url = window.location.href;
                if (navigator.share) {
                  try {
                    await navigator.share({ title: profile.full_name, url });
                  } catch { /* cancelled */ }
                } else {
                  await navigator.clipboard.writeText(url);
                  toast.success("Link do perfil copiado!");
                }
              }}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-border text-tc-text-secondary hover:bg-gray-50 transition-colors"
              title="Compartilhar"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate(`/chat?user=${id}`)}
              className="flex items-center justify-center w-9 h-9 rounded-full border border-border text-tc-text-secondary hover:bg-gray-50 transition-colors"
              title="Mensagem"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Following button */}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleFollow}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isFollowing
                ? "bg-navy-500 text-white hover:bg-navy-600"
                : "bg-white text-tc-text-secondary border border-border hover:bg-gray-50"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${isFollowing ? "fill-white" : ""}`}
            />
            {isFollowing ? "Seguindo" : "Seguir"}
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 py-4 border-t border-border mt-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4 text-rose-500" />
              <span className="text-lg font-bold text-tc-text-primary">
                0
              </span>
            </div>
            <span className="text-xs text-tc-text-hint">
              Experiências Completas
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-rose-500 fill-rose-500" />
              <span className="text-lg font-bold text-tc-text-primary">
                --
              </span>
            </div>
            <span className="text-xs text-tc-text-hint">
              Avaliação Média
            </span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Languages className="h-4 w-4 text-rose-500" />
              <span className="text-lg font-bold text-tc-text-primary">
                {profile.languages?.length || 0}
              </span>
            </div>
            <span className="text-xs text-tc-text-hint">Idiomas</span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-navy-500 text-white"
                  : "bg-white text-tc-text-secondary border border-border hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === "sobre" && renderSobreTab()}
        {activeTab === "experiencias" && renderExperienciasTab()}
        {activeTab === "publicacoes" && renderPublicacoesTab()}
        {activeTab === "avaliacoes" && renderAvaliacoesTab()}
      </div>
    </div>
  );
}

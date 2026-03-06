import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  List,
  Globe,
  User,
  Heart,
  Search,
  Filter,
  MapPin,
  Star,
  Briefcase,
  Users,
  MessageCircle,
  Share2,
  Plus,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react";
import CreatePostModal from "@/components/modals/CreatePostModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabKey = "feed" | "viajantes" | "anfitrioes";

// ---------------------------------------------------------------------------
// Filter options (not user data)
// ---------------------------------------------------------------------------

const SKILL_FILTERS = [
  "Todos",
  "Ensino",
  "Agricultura",
  "Chef",
  "Construção",
  "Marketing",
  "Tecnologia",
];

const REGION_FILTERS = [
  "Todas as Regiões",
  "América do Sul",
  "América Central",
  "Europa",
  "Ásia",
  "Oceania",
  "África",
];

const HOST_TYPE_FILTERS = [
  "Todos",
  "Hotel",
  "Fazendas",
  "ONG's",
  "Restaurantes",
  "Santuário",
];

// ---------------------------------------------------------------------------
// Tab: Feed
// ---------------------------------------------------------------------------

function TabFeed({
  onOpenCreatePost,
  posts,
  loadingPosts,
}: {
  onOpenCreatePost: () => void;
  posts: any[];
  loadingPosts: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tc-text-primary">
            Feed da Comunidade
          </h2>
          <p className="text-sm text-tc-text-hint mt-1">
            Conecte-se com anfitriões e viajantes e interaja com pessoas de
            todo o mundo!
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors">
          <Heart className="h-4 w-4" />
          Seguindo (0)
        </button>
      </div>

      {/* Real posts from Supabase */}
      {loadingPosts && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          <span className="ml-2 text-sm text-tc-text-hint">Carregando publicações...</span>
        </div>
      )}

      {posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl border border-border p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm">
                  {post.profiles?.full_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm font-bold text-tc-text-primary">{post.profiles?.full_name || "Usuário"}</p>
                  {post.location && (
                    <p className="text-xs text-tc-text-hint">{post.location}</p>
                  )}
                </div>
                <span className="ml-auto text-xs text-tc-text-hint">
                  {new Date(post.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {post.image_url && (
                <img src={post.image_url} alt="" className="w-full rounded-lg object-cover max-h-[300px]" />
              )}
              <p className="text-sm text-tc-text-primary">{post.content}</p>
              <div className="flex items-center gap-4 text-tc-text-hint text-xs">
                <span>{post.likes_count || 0} curtidas</span>
                <span>{post.comments_count || 0} comentários</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loadingPosts && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-tc-text-hint text-sm">Nenhuma publicação encontrada.</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={onOpenCreatePost}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-rose-500 text-white shadow-lg flex items-center justify-center hover:bg-rose-600 transition-colors z-50"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Viajantes
// ---------------------------------------------------------------------------

function TabViajantes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("Todos");
  const [selectedRegion, setSelectedRegion] = useState("Todas as Regiões");
  const [travelers, setTravelers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTravelers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, profiles!inner(id, full_name, avatar_url)")
        .eq("role", "supplier");

      if (!error && data) {
        const mapped = data.map((row: any) => ({
          id: row.profiles.id,
          name: row.profiles.full_name,
          avatar: row.profiles.avatar_url,
        }));
        setTravelers(mapped);
      }
      setLoading(false);
    };
    fetchTravelers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tc-text-primary">
            Descobrir Comunidade
          </h2>
          <p className="text-sm text-tc-text-hint mt-1">
            Conecte-se com viajantes e anfitriões do mundo todo
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors">
          <Heart className="h-4 w-4" />
          Seguindo (0)
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <input
            type="text"
            placeholder="Buscar viajantes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm text-tc-text-primary placeholder:text-tc-text-hint focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
          />
        </div>
        <button className="px-5 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-2">
          <Search className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-5 py-2.5 rounded-lg bg-navy-500 text-white text-sm font-medium hover:bg-navy-600 transition-colors flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="border border-border rounded-xl p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-tc-text-primary">
              Filtros Avançados
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-tc-text-hint hover:text-tc-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Habilidades */}
          <div>
            <p className="text-sm font-medium text-tc-text-primary mb-2">
              Habilidades
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILL_FILTERS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedSkill === skill
                      ? "bg-rose-500 text-white"
                      : "bg-white border border-border text-tc-text-secondary hover:border-rose-300"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Regiao */}
          <div>
            <p className="text-sm font-medium text-tc-text-primary mb-2">
              Região
            </p>
            <div className="flex flex-wrap gap-2">
              {REGION_FILTERS.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedRegion === region
                      ? "bg-rose-500 text-white"
                      : "bg-white border border-border text-tc-text-secondary hover:border-rose-300"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          <span className="ml-2 text-sm text-tc-text-hint">Carregando viajantes...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && travelers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-tc-text-hint text-sm">Nenhum viajante encontrado</p>
        </div>
      )}

      {/* Traveler grid */}
      {!loading && travelers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {travelers.map((traveler) => (
            <Link
              key={traveler.id}
              to={`/community/travelers/${traveler.id}`}
              className="block group"
            >
              <div className="rounded-xl overflow-hidden border border-border bg-white">
                {/* Cover photo with overlay */}
                <div className="relative aspect-[3/4]">
                  {traveler.avatar ? (
                    <img
                      src={traveler.avatar}
                      alt={traveler.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-rose-100 to-rose-200 flex items-center justify-center">
                      <User className="h-16 w-16 text-rose-300" />
                    </div>
                  )}

                  {/* Bottom overlay gradient */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-4 px-4">
                    <p className="text-white font-bold text-base">
                      {traveler.name}
                    </p>
                  </div>
                </div>

                {/* Below image info */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-tc-text-secondary">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      Viajante
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Anfitrioes
// ---------------------------------------------------------------------------

function TabAnfitrioes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHostType, setSelectedHostType] = useState("Todos");
  const [selectedRegion, setSelectedRegion] = useState("Todas as Regiões");
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, city, state, description, logo_url")
        .is("deleted_at", null);

      if (!error && data) {
        const mapped = data.map((org: any) => ({
          id: org.id,
          name: org.name,
          location: [org.city, org.state].filter(Boolean).join(", "),
          description: org.description || "",
          logo_url: org.logo_url,
        }));
        setHosts(mapped);
      }
      setLoading(false);
    };
    fetchHosts();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tc-text-primary">
            Descobrir Comunidade
          </h2>
          <p className="text-sm text-tc-text-hint mt-1">
            Conecte-se com viajantes e anfitriões do mundo todo
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors">
          <Heart className="h-4 w-4" />
          Seguindo (0)
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <input
            type="text"
            placeholder="Buscar anfitriões..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm text-tc-text-primary placeholder:text-tc-text-hint focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
          />
        </div>
        <button className="px-5 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-2">
          <Search className="h-4 w-4" />
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-5 py-2.5 rounded-lg bg-navy-500 text-white text-sm font-medium hover:bg-navy-600 transition-colors flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="border border-border rounded-xl p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-tc-text-primary">
              Filtros Avançados
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-tc-text-hint hover:text-tc-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tipo de Anfitriao */}
          <div>
            <p className="text-sm font-medium text-tc-text-primary mb-2">
              Tipo de Anfitrião
            </p>
            <div className="flex flex-wrap gap-2">
              {HOST_TYPE_FILTERS.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedHostType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedHostType === type
                      ? "bg-rose-500 text-white"
                      : "bg-white border border-border text-tc-text-secondary hover:border-rose-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Regiao */}
          <div>
            <p className="text-sm font-medium text-tc-text-primary mb-2">
              Região
            </p>
            <div className="flex flex-wrap gap-2">
              {REGION_FILTERS.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedRegion === region
                      ? "bg-rose-500 text-white"
                      : "bg-white border border-border text-tc-text-secondary hover:border-rose-300"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          <span className="ml-2 text-sm text-tc-text-hint">Carregando anfitriões...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && hosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-tc-text-hint text-sm">Nenhum anfitrião encontrado</p>
        </div>
      )}

      {/* Host grid */}
      {!loading && hosts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hosts.map((host) => (
            <div
              key={host.id}
              className="rounded-xl overflow-hidden border border-border bg-white"
            >
              {/* Cover photo */}
              <div className="relative aspect-video bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
                {host.logo_url ? (
                  <img
                    src={host.logo_url}
                    alt={host.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Globe className="h-12 w-12 text-navy-300" />
                )}
              </div>

              {/* Content below image */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-tc-text-primary text-base">
                    {host.name}
                  </h3>
                </div>

                {host.location && (
                  <p className="text-sm text-rose-500 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {host.location}
                  </p>
                )}

                {host.description && (
                  <p className="text-sm text-tc-text-secondary line-clamp-2">
                    {host.description}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to={`/community/hosts/${host.id}`}
                    className="flex-1 py-2 rounded-lg border border-border bg-white text-tc-text-primary text-sm font-medium text-center hover:bg-gray-50 transition-colors"
                  >
                    Ver Perfil
                  </Link>
                  <button
                    className="flex-1 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors bg-navy-500 hover:bg-navy-600"
                  >
                    <Heart className="h-4 w-4" />
                    Seguir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Community Page
// ---------------------------------------------------------------------------

export default function Community() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("feed");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from("community_posts")
      .select("*, profiles!community_posts_author_id_fkey(full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setPosts(data);
    }
    setLoadingPosts(false);
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
      key: "feed",
      label: "Feed",
      icon: <List className="h-4 w-4" />,
    },
    {
      key: "viajantes",
      label: "Viajantes",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      key: "anfitrioes",
      label: "Anfitriões",
      icon: <User className="h-4 w-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-warm-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab switcher */}
        <div className="flex items-center gap-1 mb-8 rounded-lg p-1 border border-border w-fit bg-white">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-rose-500 text-white"
                  : "text-tc-text-secondary bg-white hover:bg-gray-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "feed" && (
          <TabFeed onOpenCreatePost={() => setShowCreatePost(true)} posts={posts} loadingPosts={loadingPosts} />
        )}
        {activeTab === "viajantes" && <TabViajantes />}
        {activeTab === "anfitrioes" && <TabAnfitrioes />}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreatePost}
        onClose={() => { setShowCreatePost(false); fetchPosts(); }}
      />
    </div>
  );
}

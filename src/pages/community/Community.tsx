import { useState, useEffect, useRef } from "react";
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
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import CreatePostModal from "@/components/modals/CreatePostModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
// PostCard — adaptive layout based on image orientation
// ---------------------------------------------------------------------------

function PostCard({
  post,
  currentUserId,
  onDelete,
  onEdit,
}: {
  post: any;
  currentUserId: string | undefined;
  onDelete: (id: string) => void;
  onEdit: (post: any) => void;
}) {
  const [orientation, setOrientation] = useState<"portrait" | "landscape" | "square" | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = currentUserId === post.author_id;

  const aspect: number | null = post.image_aspect ?? null;

  useEffect(() => {
    if (!post.image_url) return;
    if (aspect) {
      if (aspect < 0.85) setOrientation("portrait");
      else if (aspect > 1.15) setOrientation("landscape");
      else setOrientation("square");
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      const r = img.naturalWidth / img.naturalHeight;
      if (r < 0.85) setOrientation("portrait");
      else if (r > 1.15) setOrientation("landscape");
      else setOrientation("square");
    };
    img.src = post.image_url;
  }, [post.image_url, aspect]);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const authorAvatar = post.profiles?.avatar_url ? (
    <img
      src={post.profiles.avatar_url}
      alt=""
      referrerPolicy="no-referrer"
      className="w-10 h-10 rounded-full object-cover shrink-0"
    />
  ) : (
    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm shrink-0">
      {post.profiles?.full_name?.[0]?.toUpperCase() || "?"}
    </div>
  );

  const headerRow = (
    <div className="flex items-center gap-3">
      {authorAvatar}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-tc-text-primary truncate">
          {post.profiles?.full_name || "Usuário"}
        </p>
        {post.location && (
          <p className="text-xs text-tc-text-hint flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {post.location}
          </p>
        )}
      </div>
      <span className="text-xs text-tc-text-hint whitespace-nowrap">
        {new Date(post.created_at).toLocaleDateString("pt-BR")}
      </span>
      {isOwner && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="h-4 w-4 text-tc-text-hint" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
              <button
                onClick={() => { setShowMenu(false); onEdit(post); }}
                className="w-full text-left px-4 py-2 text-sm text-tc-text-primary hover:bg-gray-50 flex items-center gap-2"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
              <button
                onClick={() => { setShowMenu(false); onDelete(post.id); }}
                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="flex items-center gap-4 text-tc-text-hint text-xs">
      <span>{post.likes_count || 0} curtidas</span>
      <span>{post.comments_count || 0} comentários</span>
    </div>
  );

  // PORTRAIT / VERTICAL — side by side: image left ~40%, content right
  if (post.image_url && orientation === "portrait") {
    return (
      <div className="bg-white rounded-xl border border-border overflow-hidden flex flex-col sm:flex-row">
        <div className="sm:w-2/5 shrink-0 bg-gray-100 sm:max-h-[420px] overflow-hidden">
          <img
            src={post.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-5 flex flex-col justify-between gap-3">
          <div className="space-y-3">
            {headerRow}
            <p className="text-sm text-tc-text-primary">{post.content}</p>
          </div>
          {footer}
        </div>
      </div>
    );
  }

  // LANDSCAPE / HORIZONTAL / SQUARE — stacked: image on top, content below
  // Use aspect-ratio container to prevent "zuada" stretching
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {post.image_url && (
        <div
          className="bg-gray-100 overflow-hidden"
          style={{
            aspectRatio: orientation === "landscape"
              ? `${Math.min(aspect ?? 16 / 9, 2)} / 1`
              : "1 / 1",
            maxHeight: 420,
          }}
        >
          <img
            src={post.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5 space-y-3">
        {headerRow}
        <p className="text-sm text-tc-text-primary">{post.content}</p>
        {footer}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Feed
// ---------------------------------------------------------------------------

function TabFeed({
  onOpenCreatePost,
  posts,
  loadingPosts,
  currentUserId,
  onDeletePost,
  onEditPost,
}: {
  onOpenCreatePost: () => void;
  posts: any[];
  loadingPosts: boolean;
  currentUserId: string | undefined;
  onDeletePost: (id: string) => void;
  onEditPost: (post: any) => void;
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
            <PostCard
              key={post.id}
              post={post}
              currentUserId={currentUserId}
              onDelete={onDeletePost}
              onEdit={onEditPost}
            />
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

  // Edit post state
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from("community_posts")
      .select("*, image_aspect, profiles!community_posts_author_id_fkey(full_name, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setPosts(data);
    }
    setLoadingPosts(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta publicação?")) return;
    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId);
    if (error) {
      toast.error("Erro ao excluir publicação.");
    } else {
      toast.success("Publicação excluída!");
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost(post);
    setEditCaption(post.content);
    setEditLocation(post.location || "");
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    setSavingEdit(true);
    const { error } = await supabase
      .from("community_posts")
      .update({ content: editCaption, location: editLocation || null })
      .eq("id", editingPost.id);
    if (error) {
      toast.error("Erro ao atualizar publicação.");
    } else {
      toast.success("Publicação atualizada!");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === editingPost.id
            ? { ...p, content: editCaption, location: editLocation || null }
            : p
        )
      );
      setEditingPost(null);
    }
    setSavingEdit(false);
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
          <TabFeed
            onOpenCreatePost={() => setShowCreatePost(true)}
            posts={posts}
            loadingPosts={loadingPosts}
            currentUserId={user?.id}
            onDeletePost={handleDeletePost}
            onEditPost={handleEditPost}
          />
        )}
        {activeTab === "viajantes" && <TabViajantes />}
        {activeTab === "anfitrioes" && <TabAnfitrioes />}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreatePost}
        onClose={() => { setShowCreatePost(false); fetchPosts(); }}
      />

      {/* Edit Post Modal */}
      <Dialog open={!!editingPost} onOpenChange={(v) => !v && setEditingPost(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Publicação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingPost?.image_url && (
              <div className="rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={editingPost.image_url}
                  alt=""
                  className="w-full max-h-[200px] object-contain mx-auto"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Legenda</label>
              <textarea
                value={editCaption}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setEditCaption(e.target.value);
                }}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm text-tc-text-primary focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 resize-none"
              />
              <p className="text-xs text-tc-text-hint text-right">
                {editCaption.length}/500 caracteres
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-tc-text-hint" />
                Localização
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="Localização..."
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-tc-text-primary focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setEditingPost(null)}
                className="py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit || !editCaption.trim()}
                className="py-2.5 rounded-lg bg-navy-500 text-white text-sm font-medium hover:bg-navy-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { useTranslation } from "react-i18next";
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
// Filter option keys (stable pt-BR keys used as identifiers)
// ---------------------------------------------------------------------------

const SKILL_FILTER_KEYS = ["Todos", "Ensino", "Agricultura", "Chef", "Construção", "Marketing", "Tecnologia"];
const REGION_FILTER_KEYS = ["Todas as Regiões", "América do Sul", "América Central", "Europa", "Ásia", "Oceania", "África"];
const HOST_TYPE_FILTER_KEYS = ["Todos", "Hotel", "Fazendas", "ONG's", "Restaurantes", "Santuário"];

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
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isOwner = currentUserId === post.author_id;

  useEffect(() => {
    if (!currentUserId) return;
    supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", currentUserId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setLiked(true);
      });
  }, [currentUserId, post.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUserId) return;

    if (liked) {
      const { error } = await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", currentUserId);
      if (!error) {
        setLiked(false);
        setLikesCount((c: number) => Math.max(0, c - 1));
      }
    } else {
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: post.id, user_id: currentUserId });
      if (!error) {
        setLiked(true);
        setLikesCount((c: number) => c + 1);
      }
    }
  };

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
      className="w-[49px] h-[49px] rounded-full object-cover shrink-0"
    />
  ) : (
    <div className="w-[49px] h-[49px] rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-base shrink-0">
      {post.profiles?.full_name?.[0]?.toUpperCase() || "?"}
    </div>
  );

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    navigate(`/community/post/${post.id}`);
  };

  return (
    <div
      className="bg-white border border-border rounded-[10px] overflow-hidden cursor-pointer hover:shadow-sm transition-shadow"
      onClick={handleCardClick}
    >
      {/* Header + Text section */}
      <div className="border-b border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-3">
          {authorAvatar}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <Link
                to={`/community/travelers/${post.author_id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-medium text-[#1e2939] whitespace-nowrap hover:underline"
              >
                {post.profiles?.full_name || "Usuário"}
              </Link>
            </div>
            {post.location && (
              <p className="text-[10px] text-[#6a7282] flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 shrink-0" />
                {post.location}
              </p>
            )}
            <p className="text-[10px] text-[#6a7282] mt-0.5">
              {new Date(post.created_at).toLocaleDateString(undefined, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          {isOwner && (
            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4 text-[#6a7282]" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-50 min-w-[140px]">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(post); }}
                    className="w-full text-left px-4 py-2 text-sm text-[#1e2939] hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t("common.edit")}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(post.id); }}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("common.delete")}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {post.content && (
          <p className="text-base text-[#364153] leading-normal whitespace-pre-line">
            {post.content}
          </p>
        )}
      </div>

      {post.image_url && (
        <div className="w-full h-[384px]">
          <img
            src={post.image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {post.tags && post.tags.length > 0 && (
        <div className="flex items-center gap-4 px-4 py-2.5 text-sm text-[#155dfc]">
          {post.tags.map((tag: string, i: number) => (
            <span key={i}>#{tag}</span>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 flex items-center justify-between px-4 h-[57px]">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors ${liked ? "text-rose-500" : "text-[#4a5565] hover:text-rose-500"}`}
          >
            <Heart className={`h-[18px] w-[18px] ${liked ? "fill-rose-500" : ""}`} />
            <span className="text-base">{likesCount}</span>
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-[#4a5565] hover:text-navy-500 transition-colors"
          >
            <MessageCircle className="h-[18px] w-[18px]" />
            <span className="text-base">{post.comments_count || 0}</span>
          </button>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-[#4a5565] hover:text-navy-500 transition-colors"
        >
          <Share2 className="h-5 w-5" />
        </button>
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
  followingCount,
}: {
  onOpenCreatePost: () => void;
  posts: any[];
  loadingPosts: boolean;
  currentUserId: string | undefined;
  onDeletePost: (id: string) => void;
  onEditPost: (post: any) => void;
  followingCount: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tc-text-primary">
            {t("community.feed.title")}
          </h2>
          <p className="text-sm text-tc-text-hint mt-1">
            {t("community.feed.desc")}
          </p>
        </div>
        <button className="flex items-center gap-4 px-4 py-3 rounded-[10px] bg-navy-500/10 text-navy-500 text-sm hover:bg-navy-500/20 transition-colors">
          <Heart className="h-4 w-4" />
          {t("community.feed.following", { count: followingCount })}
        </button>
      </div>

      {loadingPosts && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          <span className="ml-2 text-sm text-tc-text-hint">{t("community.feed.loading")}</span>
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
          <p className="text-tc-text-hint text-sm">{t("community.feed.none")}</p>
        </div>
      )}

      <button
        onClick={onOpenCreatePost}
        className="fixed bottom-8 right-8 w-[60px] h-[60px] rounded-full bg-navy-500 text-white shadow-[0_4px_4px_rgba(0,0,0,0.25)] flex items-center justify-center hover:bg-navy-600 transition-colors z-50"
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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(SKILL_FILTER_KEYS[0]);
  const [selectedRegion, setSelectedRegion] = useState(REGION_FILTER_KEYS[0]);
  const [travelers, setTravelers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const skillLabels: Record<string, string> = {
    "Todos": t("community.travelers.all"),
    "Ensino": t("community.filters.teaching"),
    "Agricultura": t("community.filters.agriculture"),
    "Chef": "Chef",
    "Construção": t("community.filters.construction"),
    "Marketing": "Marketing",
    "Tecnologia": t("community.filters.technology"),
  };

  const regionLabels: Record<string, string> = {
    "Todas as Regiões": t("community.travelers.allRegions"),
    "América do Sul": t("community.filters.southAmerica"),
    "América Central": t("community.filters.centralAmerica"),
    "Europa": t("community.filters.europe"),
    "Ásia": t("community.filters.asia"),
    "Oceania": t("community.filters.oceania"),
    "África": t("community.filters.africa"),
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tc-text-primary">
            {t("community.title")}
          </h2>
          <p className="text-sm text-tc-text-hint mt-1">
            {t("community.subtitle")}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors">
          <Heart className="h-4 w-4" />
          {t("community.feed.following", { count: 0 })}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <input
            type="text"
            placeholder={t("community.travelers.searchPlaceholder")}
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
          {t("common.filters")}
        </button>
      </div>

      {showFilters && (
        <div className="border border-border rounded-xl p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-tc-text-primary">
              {t("community.travelers.advancedFilters")}
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-tc-text-hint hover:text-tc-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-tc-text-primary mb-2">
              {t("community.travelers.skills")}
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILL_FILTER_KEYS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSelectedSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedSkill === skill
                      ? "bg-rose-500 text-white"
                      : "bg-white border border-border text-tc-text-secondary hover:border-rose-300"
                  }`}
                >
                  {skillLabels[skill] ?? skill}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-tc-text-primary mb-2">
              {t("community.travelers.region")}
            </p>
            <div className="flex flex-wrap gap-2">
              {REGION_FILTER_KEYS.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedRegion === region
                      ? "bg-rose-500 text-white"
                      : "bg-white border border-border text-tc-text-secondary hover:border-rose-300"
                  }`}
                >
                  {regionLabels[region] ?? region}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          <span className="ml-2 text-sm text-tc-text-hint">{t("community.travelers.loading")}</span>
        </div>
      )}

      {!loading && travelers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-tc-text-hint text-sm">{t("community.travelers.none")}</p>
        </div>
      )}

      {!loading && travelers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {travelers.map((traveler) => (
            <Link
              key={traveler.id}
              to={`/community/travelers/${traveler.id}`}
              className="block group"
            >
              <div className="rounded-xl overflow-hidden border border-border bg-white">
                <div className="relative aspect-[3/4]">
                  {traveler.avatar ? (
                    <img
                      src={traveler.avatar}
                      alt={traveler.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-rose-100 to-rose-200 flex items-center justify-center">
                      <User className="h-16 w-16 text-rose-300" />
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-4 px-4">
                    <p className="text-white font-bold text-base">
                      {traveler.name}
                    </p>
                  </div>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-tc-text-secondary">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {t("community.travelerRole")}
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
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedHostType, setSelectedHostType] = useState(HOST_TYPE_FILTER_KEYS[0]);
  const [selectedRegion, setSelectedRegion] = useState(REGION_FILTER_KEYS[0]);
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const hostTypeLabels: Record<string, string> = {
    "Todos": t("community.hosts.all"),
    "Hotel": t("community.filters.hotel"),
    "Fazendas": t("community.filters.farms"),
    "ONG's": t("community.filters.ngos"),
    "Restaurantes": t("community.filters.restaurants"),
    "Santuário": t("community.filters.sanctuary"),
  };

  const regionLabels: Record<string, string> = {
    "Todas as Regiões": t("community.travelers.allRegions"),
    "América do Sul": t("community.filters.southAmerica"),
    "América Central": t("community.filters.centralAmerica"),
    "Europa": t("community.filters.europe"),
    "Ásia": t("community.filters.asia"),
    "Oceania": t("community.filters.oceania"),
    "África": t("community.filters.africa"),
  };

  useEffect(() => {
    const fetchHosts = async () => {
      setLoading(true);
      const { data: buyerProfiles } = await supabase
        .from("user_roles")
        .select("user_id, profiles!inner(organization_id)")
        .eq("role", "buyer");

      const hostOrgIds = (buyerProfiles || [])
        .map((r: any) => r.profiles?.organization_id)
        .filter(Boolean);

      if (hostOrgIds.length === 0) {
        setHosts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, city, state, description, logo_url")
        .in("id", hostOrgIds)
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tc-text-primary">
            {t("community.title")}
          </h2>
          <p className="text-sm text-tc-text-hint mt-1">
            {t("community.subtitle")}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors">
          <Heart className="h-4 w-4" />
          {t("community.feed.following", { count: 0 })}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <input
            type="text"
            placeholder={t("community.hosts.searchPlaceholder")}
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
          {t("common.filters")}
        </button>
      </div>

      {showFilters && (
        <div className="border border-border rounded-xl p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-tc-text-primary">
              {t("community.travelers.advancedFilters")}
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-tc-text-hint hover:text-tc-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-tc-text-primary mb-2">
              {t("community.hosts.hostType")}
            </p>
            <div className="flex flex-wrap gap-2">
              {HOST_TYPE_FILTER_KEYS.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedHostType(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedHostType === type
                      ? "bg-rose-500 text-white"
                      : "bg-white border border-border text-tc-text-secondary hover:border-rose-300"
                  }`}
                >
                  {hostTypeLabels[type] ?? type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-tc-text-primary mb-2">
              {t("community.travelers.region")}
            </p>
            <div className="flex flex-wrap gap-2">
              {REGION_FILTER_KEYS.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedRegion === region
                      ? "bg-rose-500 text-white"
                      : "bg-white border border-border text-tc-text-secondary hover:border-rose-300"
                  }`}
                >
                  {regionLabels[region] ?? region}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
          <span className="ml-2 text-sm text-tc-text-hint">{t("community.hosts.loading")}</span>
        </div>
      )}

      {!loading && hosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-tc-text-hint text-sm">{t("community.hosts.none")}</p>
        </div>
      )}

      {!loading && hosts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hosts.map((host) => (
            <div
              key={host.id}
              className="rounded-xl overflow-hidden border border-border bg-white"
            >
              <div className="relative aspect-video bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
                {host.logo_url ? (
                  <img
                    src={host.logo_url}
                    alt={host.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Globe className="h-12 w-12 text-navy-300" />
                )}
              </div>

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

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to={`/community/hosts/${host.id}`}
                    className="flex-1 py-2 rounded-lg border border-border bg-white text-tc-text-primary text-sm font-medium text-center hover:bg-gray-50 transition-colors"
                  >
                    {t("community.hosts.viewProfile")}
                  </Link>
                  <button
                    className="flex-1 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors bg-navy-500 hover:bg-navy-600"
                  >
                    <Heart className="h-4 w-4" />
                    {t("common.follow")}
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
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("feed");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    fetchPosts();
    fetchFollowingCount();
  }, []);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from("community_posts")
      .select("*, image_aspect, profiles!community_posts_author_id_fkey(full_name, avatar_url), post_likes(count), post_comments(count)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      const enriched = data.map((p: any) => ({
        ...p,
        likes_count: p.post_likes?.[0]?.count ?? p.likes_count ?? 0,
        comments_count: p.post_comments?.[0]?.count ?? p.comments_count ?? 0,
      }));
      setPosts(enriched);
    }
    setLoadingPosts(false);
  };

  const fetchFollowingCount = async () => {
    if (!user) return;
    const { count } = await (supabase.from("user_follows" as any) as any)
      .select("*", { count: "exact", head: true })
      .eq("follower_id", user.id);
    setFollowingCount(count || 0);
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm(t("community.feed.deleteConfirm"))) return;
    const { error } = await supabase
      .from("community_posts")
      .delete()
      .eq("id", postId);
    if (error) {
      toast.error(t("community.feed.deleteError"));
    } else {
      toast.success(t("community.feed.deleted"));
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
      toast.error(t("community.feed.updateError"));
    } else {
      toast.success(t("community.feed.updated"));
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
      label: t("community.tabs.feed"),
      icon: <List className="h-4 w-4" />,
    },
    {
      key: "viajantes",
      label: t("community.tabs.travelers"),
      icon: <Globe className="h-4 w-4" />,
    },
    {
      key: "anfitrioes",
      label: t("community.tabs.hosts"),
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
            followingCount={followingCount}
            onEditPost={handleEditPost}
          />
        )}
        {activeTab === "viajantes" && <TabViajantes />}
        {activeTab === "anfitrioes" && <TabAnfitrioes />}
      </div>

      <CreatePostModal
        open={showCreatePost}
        onClose={() => { setShowCreatePost(false); fetchPosts(); }}
      />

      {/* Edit Post Modal */}
      <Dialog open={!!editingPost} onOpenChange={(v) => !v && setEditingPost(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("community.feed.editPost")}</DialogTitle>
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
              <label className="text-sm font-medium">{t("community.feed.caption")}</label>
              <textarea
                value={editCaption}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setEditCaption(e.target.value);
                }}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm text-tc-text-primary focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 resize-none"
              />
              <p className="text-xs text-tc-text-hint text-right">
                {editCaption.length}/500 {t("community.characters")}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-tc-text-hint" />
                {t("community.feed.location")}
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder={t("community.feed.locationPlaceholder")}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-tc-text-primary focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setEditingPost(null)}
                className="py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={savingEdit || !editCaption.trim()}
                className="py-2.5 rounded-lg bg-navy-500 text-white text-sm font-medium hover:bg-navy-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingEdit && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("common.save")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

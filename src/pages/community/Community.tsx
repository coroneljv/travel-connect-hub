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

interface Post {
  id: number;
  author: string;
  role: "viajante" | "anfitriao";
  avatar: string;
  location: string;
  flag: string;
  date: string;
  text: string;
  image?: string;
  tags: string[];
  likes: number;
  comments: number;
}

interface Traveler {
  id: string;
  name: string;
  age: number;
  role: string;
  location: string;
  flag: string;
  avatar: string;
  rating: number;
  experiences: number;
  followers: number;
  skills: string[];
  following: boolean;
  verified: boolean;
}

interface Host {
  id: string;
  name: string;
  location: string;
  description: string;
  cover: string;
  followers: number;
  rating: number;
  following: boolean;
  verified: boolean;
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    author: "Sophie Martin",
    role: "viajante",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
    location: "Machu Picchu, Peru",
    flag: "\u{1F1F5}\u{1F1EA}",
    date: "9 de dezembro de 2024",
    text: "Que experi\u00eancia incr\u00edvel trabalhando com crian\u00e7as em Cusco! \u{1F4DA} Passei 2 meses ensinando franc\u00eas e ingl\u00eas em uma escola comunit\u00e1ria. As crian\u00e7as s\u00e3o t\u00e3o receptivas e cheias de energia! Terminamos o projeto com uma visita a Machu Picchu - um sonho realizado! Gratid\u00e3o imensa a toda equipe da escola! \u{1F64F}\u2728",
    image:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&h=400&fit=crop",
    tags: ["#Voluntariado", "#Educacao", "#Peru", "#MachuPicchu"],
    likes: 1247,
    comments: 89,
  },
  {
    id: 2,
    author: "Eco Lodge Costa Rica",
    role: "anfitriao",
    avatar:
      "https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=96&h=96&fit=crop",
    location: "Costa Rica",
    flag: "\u{1F1E8}\u{1F1F7}",
    date: "8 de dezembro de 2024",
    text: "Estamos muito felizes em compartilhar que nosso programa de conserva\u00e7\u00e3o de tartarugas marinhas foi reconhecido internacionalmente! \u{1F422} Gra\u00e7as aos nossos volunt\u00e1rios incr\u00edveis, conseguimos proteger mais de 500 ninhos nesta temporada. Se voc\u00ea ama a natureza e quer fazer a diferen\u00e7a, venha fazer parte!",
    image:
      "https://images.unsplash.com/photo-1518467166778-b88f373ffec7?w=800&h=400&fit=crop",
    tags: ["#Conserva\u00e7\u00e3o", "#CostaRica", "#Tartarugas", "#Voluntariado"],
    likes: 892,
    comments: 156,
  },
  {
    id: 3,
    author: "Lucas Oliveira",
    role: "viajante",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop",
    location: "Bali, Indon\u00e9sia",
    flag: "\u{1F1EE}\u{1F1E9}",
    date: "7 de dezembro de 2024",
    text: "3 meses como bartender em Ubud e posso dizer que foi transformador! \u{1F379} Aprendi n\u00e3o s\u00f3 mixologia, mas tamb\u00e9m sobre a cultura balinesa incr\u00edvel. As cerim\u00f4nias nos templos, o surf de manh\u00e3 cedo, as amizades que fiz... Bali tem um jeito especial de tocar a alma. Obrigado @BaliEcoVillage!",
    tags: ["#Bali", "#Bartender", "#CulturaBali", "#Intercambio"],
    likes: 634,
    comments: 45,
  },
];

const MOCK_TRAVELERS: Traveler[] = [
  {
    id: "t1",
    name: "Sophie Martin",
    age: 24,
    role: "Volunt\u00e1ria em Fazenda",
    location: "Cusco, Peru",
    flag: "\u{1F1F5}\u{1F1EA}",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop",
    rating: 4.8,
    experiences: 6,
    followers: 289,
    skills: ["Ensino", "Agricultura"],
    following: true,
    verified: true,
  },
  {
    id: "t2",
    name: "Jo\u00e3o Silva Santos",
    age: 28,
    role: "Professor",
    location: "S\u00e3o Paulo, Brasil",
    flag: "\u{1F1E7}\u{1F1F7}",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    rating: 5,
    experiences: 12,
    followers: 557,
    skills: ["Chef", "Recepcionista"],
    following: false,
    verified: true,
  },
  {
    id: "t3",
    name: "Maria Silva",
    age: 26,
    role: "Professora de Ingl\u00eas",
    location: "Bali, Indon\u00e9sia",
    flag: "\u{1F1EE}\u{1F1E9}",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop",
    rating: 4.9,
    experiences: 8,
    followers: 342,
    skills: ["Ensino de idiomas"],
    following: true,
    verified: true,
  },
  {
    id: "t4",
    name: "Jake Thompson",
    age: 31,
    role: "Construtor Volunt\u00e1rio",
    location: "Chiang Mai, Tail\u00e2ndia",
    flag: "\u{1F1F9}\u{1F1ED}",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop",
    rating: 4.9,
    experiences: 10,
    followers: 445,
    skills: ["Constru\u00e7\u00e3o", "Agricultura"],
    following: false,
    verified: true,
  },
  {
    id: "t5",
    name: "Carlos Mendoza",
    age: 35,
    role: "Fot\u00f3grafo",
    location: "Medell\u00edn, Col\u00f4mbia",
    flag: "\u{1F1E8}\u{1F1F4}",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop",
    rating: 4.7,
    experiences: 5,
    followers: 198,
    skills: ["Fotografia", "Marketing"],
    following: false,
    verified: true,
  },
  {
    id: "t6",
    name: "Elena Rodriguez",
    age: 27,
    role: "Chef Volunt\u00e1ria",
    location: "Buenos Aires, Argentina",
    flag: "\u{1F1E6}\u{1F1F7}",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop",
    rating: 4.6,
    experiences: 4,
    followers: 167,
    skills: ["Chef", "Ensino"],
    following: true,
    verified: true,
  },
  {
    id: "t7",
    name: "Anna Lee",
    age: 29,
    role: "Yoga Instructor",
    location: "Goa, \u00cdndia",
    flag: "\u{1F1EE}\u{1F1F3}",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop",
    rating: 4.8,
    experiences: 7,
    followers: 312,
    skills: ["Yoga", "Medita\u00e7\u00e3o"],
    following: false,
    verified: true,
  },
  {
    id: "t8",
    name: "Tom Anderson",
    age: 32,
    role: "Surfista e Professor",
    location: "Gold Coast, Austr\u00e1lia",
    flag: "\u{1F1E6}\u{1F1FA}",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop",
    rating: 4.5,
    experiences: 9,
    followers: 521,
    skills: ["Surf", "Ensino"],
    following: false,
    verified: true,
  },
];

const MOCK_HOSTS: Host[] = [
  {
    id: "h1",
    name: "Beach Life Hotel",
    location: "Fernando de Noronha, Pernambuco",
    description:
      "Hotel boutique a poucos passos da praia mais conhecida da ilha.",
    cover:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop",
    followers: 1234,
    rating: 4.8,
    following: true,
    verified: true,
  },
  {
    id: "h2",
    name: "Bali Eco Vilage",
    location: "Ubud, Bali, Indon\u00e9sia",
    description:
      "Vila ecol\u00f3gica no cora\u00e7\u00e3o de Ubud com foco em sustentabilidade e yoga",
    cover:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=300&fit=crop",
    followers: 3567,
    rating: 5,
    following: false,
    verified: true,
  },
  {
    id: "h3",
    name: "Elephant Sanctuary Thailand",
    location: "Chiang Mai, Tail\u00e2ndia",
    description:
      "Santu\u00e1rio \u00e9tico de elefantes resgatados em meio \u00e0 floresta tropical",
    cover:
      "https://images.unsplash.com/photo-1603483080228-04f2313d9f10?w=600&h=300&fit=crop",
    followers: 2265,
    rating: 5,
    following: false,
    verified: true,
  },
  {
    id: "h4",
    name: "Mountain Retreat Nepal",
    location: "Pokhara, Nepal",
    description:
      "Ref\u00fagio nas montanhas com vista para o Himalaia e pr\u00e1ticas de medita\u00e7\u00e3o",
    cover:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=300&fit=crop",
    followers: 890,
    rating: 4.7,
    following: false,
    verified: true,
  },
  {
    id: "h5",
    name: "Safari Lodge Kenya",
    location: "Masai Mara, Qu\u00eania",
    description:
      "Experi\u00eancia aut\u00eantica de safari com programas de conserva\u00e7\u00e3o da vida selvagem",
    cover:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&h=300&fit=crop",
    followers: 1567,
    rating: 4.9,
    following: false,
    verified: true,
  },
  {
    id: "h6",
    name: "Patagonia Adventure",
    location: "Torres del Paine, Chile",
    description:
      "Base camp para aventuras na Patag\u00f4nia com trilhas e escaladas guiadas",
    cover:
      "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=600&h=300&fit=crop",
    followers: 2100,
    rating: 4.8,
    following: false,
    verified: true,
  },
];

const SKILL_FILTERS = [
  "Todos",
  "Ensino",
  "Agricultura",
  "Chef",
  "Constru\u00e7\u00e3o",
  "Marketing",
  "Tecnologia",
];

const REGION_FILTERS = [
  "Todas as Regi\u00f5es",
  "Am\u00e9rica do Sul",
  "Am\u00e9rica Central",
  "Europa",
  "\u00c1sia",
  "Oceania",
  "\u00c1frica",
];

const HOST_TYPE_FILTERS = [
  "Todos",
  "Hotel",
  "Fazendas",
  "ONG's",
  "Restaurantes",
  "Santu\u00e1rio",
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
            Conecte-se com anfitri\u00f5es e viajantes e interaja com pessoas de
            todo o mundo!
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors">
          <Heart className="h-4 w-4" />
          Seguindo (8)
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

      {/* Mock post cards */}
      <div className="flex flex-col gap-4">
        {MOCK_POSTS.map((post) => (
          <div
            key={post.id}
            className="border border-border rounded-xl p-6 bg-white"
          >
            {/* Post header */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={post.avatar}
                alt={post.author}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-tc-text-primary text-sm">
                    {post.author}
                  </span>
                  {post.role === "viajante" ? (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-rose-100 text-rose-700">
                      Viajante
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-navy-100 text-navy-700">
                      Anfitri\u00e3o
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-tc-text-hint mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {post.location}
                  </span>
                  <span>{post.flag}</span>
                  <span>\u00b7</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>

            {/* Post body */}
            <p className="text-sm text-tc-text-primary mb-4 leading-relaxed">
              {post.text}
            </p>

            {/* Post image */}
            {post.image && (
              <img
                src={post.image}
                alt="Publica\u00e7\u00e3o"
                className="w-full rounded-lg mb-4 object-cover"
              />
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-sm text-rose-500 cursor-pointer hover:underline"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-6 text-tc-text-secondary text-sm">
              <button className="flex items-center gap-1.5 hover:text-rose-500 transition-colors">
                <Heart className="h-4 w-4" />
                {post.likes.toLocaleString("pt-BR")}
              </button>
              <button className="flex items-center gap-1.5 hover:text-navy-500 transition-colors">
                <MessageCircle className="h-4 w-4" />
                {post.comments}
              </button>
              <button className="ml-auto flex items-center gap-1.5 hover:text-navy-500 transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

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
  const [selectedRegion, setSelectedRegion] = useState("Todas as Regi\u00f5es");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tc-text-primary">
            Descobrir Comunidade
          </h2>
          <p className="text-sm text-tc-text-hint mt-1">
            Conecte-se com viajantes e anfitri\u00f5es do mundo todo
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors">
          <Heart className="h-4 w-4" />
          Seguindo (3)
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
              Filtros Avan\u00e7ados
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
              Regi\u00e3o
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

      {/* Traveler grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_TRAVELERS.map((traveler) => (
          <Link
            key={traveler.id}
            to={`/community/travelers/${traveler.id}`}
            className="block group"
          >
            <div className="rounded-xl overflow-hidden border border-border bg-white">
              {/* Cover photo with overlay */}
              <div className="relative aspect-[3/4]">
                <img
                  src={traveler.avatar}
                  alt={traveler.name}
                  className="w-full h-full object-cover"
                />

                {/* Verified badge top-left */}
                {traveler.verified && (
                  <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}

                {/* Heart/follow button top-right */}
                <button
                  onClick={(e) => e.preventDefault()}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    traveler.following
                      ? "bg-rose-500 text-white"
                      : "bg-white/80 text-rose-500 hover:bg-rose-500 hover:text-white"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      traveler.following ? "fill-white" : ""
                    }`}
                  />
                </button>

                {/* Bottom overlay gradient */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20 pb-4 px-4">
                  <p className="text-white font-bold text-base">
                    {traveler.name}, {traveler.age}
                  </p>
                  <p className="text-white/80 text-sm">{traveler.role}</p>
                  <p className="text-white/70 text-xs flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {traveler.location} {traveler.flag}
                  </p>
                </div>
              </div>

              {/* Below image info */}
              <div className="p-3 space-y-2">
                {/* Stats row */}
                <div className="flex items-center gap-3 text-xs text-tc-text-secondary">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    {traveler.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />
                    {traveler.experiences}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {traveler.followers}
                  </span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {traveler.skills.slice(0, 2).map((skill) => (
                    <span
                      key={skill}
                      className="border border-border rounded-full text-xs px-2 py-0.5 text-tc-text-secondary"
                    >
                      {skill}
                    </span>
                  ))}
                  {traveler.skills.length > 2 && (
                    <span className="border border-border rounded-full text-xs px-2 py-0.5 text-tc-text-secondary">
                      +{traveler.skills.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
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
  const [selectedRegion, setSelectedRegion] = useState("Todas as Regi\u00f5es");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-tc-text-primary">
            Descobrir Comunidade
          </h2>
          <p className="text-sm text-tc-text-hint mt-1">
            Conecte-se com viajantes e anfitri\u00f5es do mundo todo
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors">
          <Heart className="h-4 w-4" />
          Seguindo (3)
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <input
            type="text"
            placeholder="Buscar anfitri\u00f5es..."
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
              Filtros Avan\u00e7ados
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
              Tipo de Anfitri\u00e3o
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
              Regi\u00e3o
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

      {/* Host grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_HOSTS.map((host) => (
          <div
            key={host.id}
            className="rounded-xl overflow-hidden border border-border bg-white"
          >
            {/* Cover photo */}
            <div className="relative aspect-video">
              <img
                src={host.cover}
                alt={host.name}
                className="w-full h-full object-cover"
              />
              {/* Verified badge top-right */}
              {host.verified && (
                <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            {/* Content below image */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-tc-text-primary text-base">
                  {host.name}
                </h3>
                {host.verified && (
                  <CheckCircle2 className="h-4 w-4 text-blue-500 shrink-0" />
                )}
              </div>

              <p className="text-sm text-rose-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {host.location}
              </p>

              <p className="text-sm text-tc-text-secondary line-clamp-2">
                {host.description}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-tc-text-secondary">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {host.followers.toLocaleString("pt-BR")} Seguidores
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  {host.rating}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  to={`/community/hosts/${host.id}`}
                  className="flex-1 py-2 rounded-lg border border-border bg-white text-tc-text-primary text-sm font-medium text-center hover:bg-gray-50 transition-colors"
                >
                  Ver Perfil
                </Link>
                <button
                  className={`flex-1 py-2 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    host.following
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-navy-500 hover:bg-navy-600"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      host.following ? "fill-white" : ""
                    }`}
                  />
                  {host.following ? "Seguindo" : "Seguir"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
      label: "Anfitri\u00f5es",
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

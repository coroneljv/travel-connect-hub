import { useState } from "react";
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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabId = "sobre" | "oportunidades" | "publicacoes" | "avaliacoes";

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const HOST = {
  name: "Beach Life Hotel",
  location: "Fernando de Noronha, Pernambuco, Brasil",
  rating: 4.8,
  reviewCount: 127,
  followers: 1234,
  coverImage:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=400&fit=crop",
  avatar:
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=160&h=160&fit=crop",
  verified: true,
  online: true,
  stats: {
    hosted: 89,
    responseRate: "95%",
    responseTime: "2 horas",
  },
  about:
    "Somos um hostel boutique localizado a poucos passos da praia de Jurerê Internacional. Nossa missão é proporcionar experiências autênticas de intercâmbio cultural, conectando viajantes do mundo todo com nossa equipe local apaixonada. Valorizamos sustentabilidade, diversidade e a construção de uma comunidade global.",
  mission:
    "Criar conexões genuínas entre culturas através da hospitalidade consciente e sustentável.",
  values: [
    "Sustentabilidade",
    "Diversidade Cultural",
    "Hospitalidade",
    "Comunidade",
    "Educação",
    "Respeito",
  ],
  info: {
    type: "Hostel / Pousada",
    languages: "Português, Inglês, Espanhol",
    checkIn: "14:00",
    checkOut: "11:00",
    capacity: "40 hóspedes",
  },
};

const MOCK_OPPORTUNITIES = [
  {
    id: "opp-1",
    title: "Recepcionista de Hotel",
    duration: "2 meses",
    type: "Intercâmbio de trabalho",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=250&fit=crop",
    skills: ["Atendimento", "Inglês"],
  },
  {
    id: "opp-2",
    title: "Social Media Manager",
    duration: "3 meses",
    type: "Intercâmbio de trabalho",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&h=250&fit=crop",
    skills: ["Marketing", "Design"],
  },
  {
    id: "opp-3",
    title: "Bartender & Events",
    duration: "4 meses",
    type: "Intercâmbio de trabalho",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop",
    skills: ["Bartender", "Eventos"],
  },
];

const MOCK_POSTS = [
  {
    id: "post-1",
    title: "Nova Oportunidade: Social Media Manager",
    text: "Estamos abrindo uma nova vaga para gerenciar nossas redes sociais! Se você é criativo e ama contar histórias, essa oportunidade é para vo...",
    date: "2 dias atrás",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=300&fit=crop",
    tags: ["Social Media", "Marketing", "Criatividade"],
    likes: 42,
    comments: 8,
  },
  {
    id: "post-2",
    title: "Dia de Voluntariado na Praia",
    text: "Nosso time de voluntários organizou uma limpeza de praia incrível no último final de semana. Mais de 50kg de resíduos recolhidos! Orgulho da nossa equipe...",
    date: "5 dias atrás",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop",
    tags: ["Sustentabilidade", "Voluntariado", "Comunidade"],
    likes: 87,
    comments: 15,
  },
];

const MOCK_REVIEWS = [
  {
    id: "rev-1",
    name: "Mariana Silva",
    role: "Voluntário",
    duration: "2 meses",
    avatar:
      "https://ui-avatars.com/api/?name=Mariana+Silva&background=CF3952&color=fff&size=96",
    rating: 5,
    text: "Experiência incrível! A equipe é muito acolhedora e a localização é perfeita. Aprendi muito durante minha estadia e fiz amizades para a vida toda. Recomendo demais!",
    tags: ["Ótima localização", "Equipe acolhedora"],
  },
  {
    id: "rev-2",
    name: "Lucas Fernandes",
    role: "Voluntário",
    duration: "3 meses",
    avatar:
      "https://ui-avatars.com/api/?name=Lucas+Fernandes&background=364763&color=fff&size=96",
    rating: 5,
    text: "O Beach Life Hotel é simplesmente sensacional. A gestão é muito organizada, os horários são respeitados e há um equilíbrio perfeito entre trabalho e lazer. Voltaria sem pensar duas vezes.",
    tags: ["Bem organizado", "Ótimo equilíbrio trabalho/lazer"],
  },
  {
    id: "rev-3",
    name: "Sophie Martin",
    role: "Voluntário",
    duration: "1 mês",
    avatar:
      "https://ui-avatars.com/api/?name=Sophie+Martin&background=E8836B&color=fff&size=96",
    rating: 4,
    text: "Ótima experiência no geral. O hostel tem uma energia maravilhosa e os hóspedes são pessoas fantásticas. A única melhoria seria na comunicação de tarefas diárias.",
    tags: ["Boa energia", "Hóspedes incríveis", "Localização privilegiada"],
  },
];

const RATING_BARS = [
  { stars: 5, percent: 75 },
  { stars: 4, percent: 15 },
  { stars: 3, percent: 5 },
  { stars: 2, percent: 3 },
  { stars: 1, percent: 2 },
];

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

function TabSobre() {
  return (
    <div className="space-y-6">
      {/* Sobre Nós */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-base font-bold text-tc-text-primary mb-3">
          Sobre Nós
        </h3>
        <p className="text-sm text-tc-text-secondary leading-relaxed">
          {HOST.about}
        </p>
      </div>

      {/* Nossa Missão */}
      <div className="bg-warm-gray rounded-lg p-4">
        <h4 className="text-sm font-semibold text-tc-text-primary mb-2">
          Nossa Missão
        </h4>
        <p className="text-sm text-tc-text-secondary italic leading-relaxed">
          {HOST.mission}
        </p>
      </div>

      {/* Nossos Valores */}
      <div>
        <h4 className="text-sm font-semibold text-tc-text-primary mb-3">
          Nossos Valores
        </h4>
        <div className="flex flex-wrap gap-2">
          {HOST.values.map((value) => (
            <span
              key={value}
              className="px-3 py-1.5 text-xs font-medium rounded-full bg-navy-50 text-navy-600 border border-navy-100"
            >
              {value}
            </span>
          ))}
        </div>
      </div>

      {/* Informações */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-base font-bold text-tc-text-primary mb-4">
          Informações
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Home className="h-4 w-4 text-tc-text-hint flex-shrink-0" />
            <div>
              <p className="text-xs text-tc-text-hint">Tipo</p>
              <p className="text-sm font-medium text-tc-text-primary">
                {HOST.info.type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-tc-text-hint flex-shrink-0" />
            <div>
              <p className="text-xs text-tc-text-hint">Idiomas</p>
              <p className="text-sm font-medium text-tc-text-primary">
                {HOST.info.languages}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-tc-text-hint flex-shrink-0" />
            <div>
              <p className="text-xs text-tc-text-hint">Check-in</p>
              <p className="text-sm font-medium text-tc-text-primary">
                {HOST.info.checkIn}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-4 w-4 text-tc-text-hint flex-shrink-0" />
            <div>
              <p className="text-xs text-tc-text-hint">Check-out</p>
              <p className="text-sm font-medium text-tc-text-primary">
                {HOST.info.checkOut}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="h-4 w-4 text-tc-text-hint flex-shrink-0" />
            <div>
              <p className="text-xs text-tc-text-hint">Capacidade</p>
              <p className="text-sm font-medium text-tc-text-primary">
                {HOST.info.capacity}
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

function TabOportunidades() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {MOCK_OPPORTUNITIES.map((opp) => (
        <div
          key={opp.id}
          className="rounded-xl overflow-hidden border border-border bg-white"
        >
          {/* Image */}
          <div className="relative aspect-video">
            <img
              src={opp.image}
              alt={opp.title}
              className="w-full h-full object-cover"
            />
            {/* Status badge */}
            <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-emerald-500 text-white">
              Aberto
            </span>
            {/* Type badge */}
            <span className="absolute top-3 right-3 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-navy-500/80 text-white">
              {opp.type}
            </span>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-tc-text-primary">
                {opp.title}
              </h4>
              <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-tc-text-hint">
              <Calendar className="h-3.5 w-3.5" />
              <span>{opp.duration}</span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {opp.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-warm-gray text-tc-text-secondary"
                >
                  {skill}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="w-full py-2 text-sm font-medium text-tc-text-primary border border-border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ver Detalhes
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab Content: Publicações
// ---------------------------------------------------------------------------

function TabPublicacoes() {
  return (
    <div className="space-y-4">
      {MOCK_POSTS.map((post) => (
        <div
          key={post.id}
          className="border border-border rounded-xl bg-white overflow-hidden"
        >
          {/* Post header */}
          <div className="flex items-center gap-3 p-4 pb-2">
            <img
              src={HOST.avatar}
              alt={HOST.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-tc-text-primary">
                Beach Life Hostel
              </p>
              <p className="text-xs text-tc-text-hint">{post.date}</p>
            </div>
          </div>

          {/* Post body */}
          <div className="px-4 pb-3 space-y-2">
            <h4 className="text-sm font-bold text-tc-text-primary">
              {post.title}
            </h4>
            <p className="text-sm text-tc-text-secondary leading-relaxed">
              {post.text}
            </p>
          </div>

          {/* Post image */}
          <img
            src={post.image}
            alt={post.title}
            className="w-full aspect-video object-cover"
          />

          {/* Tags + engagement */}
          <div className="p-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-navy-50 text-navy-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-tc-text-hint">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {post.comments}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab Content: Avaliações
// ---------------------------------------------------------------------------

function TabAvaliacoes() {
  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Left: big number */}
          <div className="flex flex-col items-center justify-center sm:min-w-[140px]">
            <p className="text-5xl font-bold text-tc-text-primary">
              {HOST.rating}
            </p>
            <StarsRow rating={HOST.rating} size="h-5 w-5" />
            <p className="text-xs text-tc-text-hint mt-1">
              {HOST.reviewCount} avaliações
            </p>
          </div>

          {/* Right: rating bars */}
          <div className="flex-1 space-y-2">
            {RATING_BARS.map((bar) => (
              <div key={bar.stars} className="flex items-center gap-2">
                <span className="text-xs text-tc-text-secondary w-6 text-right">
                  {bar.stars}
                </span>
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${bar.percent}%` }}
                  />
                </div>
                <span className="text-xs text-tc-text-hint w-8">
                  {bar.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {MOCK_REVIEWS.map((review) => (
          <div
            key={review.id}
            className="border border-border rounded-xl p-4 bg-white space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-tc-text-primary">
                    {review.name}
                  </p>
                  <p className="text-xs text-tc-text-hint">
                    {review.role} &bull; {review.duration}
                  </p>
                </div>
              </div>
              <StarsRow rating={review.rating} />
            </div>

            {/* Text */}
            <p className="text-sm text-tc-text-secondary leading-relaxed">
              {review.text}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {review.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
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
  { id: "publicacoes", label: "Publicações" },
  { id: "avaliacoes", label: "Avaliações" },
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function HostProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>("sobre");
  const [isFollowing, setIsFollowing] = useState(false);

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
        <img
          src={HOST.coverImage}
          alt="Cover"
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Profile card */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        <div className="border border-border rounded-xl bg-white p-6">
          {/* Top row: avatar + info + actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Avatar */}
            <div className="relative -mt-16 flex-shrink-0">
              <img
                src={HOST.avatar}
                alt={HOST.name}
                className="w-20 h-20 rounded-xl border-4 border-white object-cover"
              />
              {HOST.online && (
                <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-tc-online rounded-full border-2 border-white" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-tc-text-primary truncate">
                  {HOST.name}
                </h1>
                {HOST.verified && (
                  <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-1 mt-1 text-sm text-rose-500">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{HOST.location}</span>
              </div>

              <div className="flex items-center gap-4 mt-1.5 text-sm text-tc-text-secondary">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  {HOST.rating} ({HOST.reviewCount} avaliações)
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {HOST.followers.toLocaleString("pt-BR")} seguidores
                </span>
              </div>
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
                <span className="text-sm font-bold text-tc-text-primary">
                  {HOST.stats.hosted}
                </span>
                <span className="text-xs text-tc-text-hint ml-1">
                  Viajantes Hospedados
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-rose-500" />
              <div>
                <span className="text-sm font-bold text-tc-text-primary">
                  {HOST.stats.responseRate}
                </span>
                <span className="text-xs text-tc-text-hint ml-1">
                  Taxa de Resposta
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-rose-500" />
              <div>
                <span className="text-sm font-bold text-tc-text-primary">
                  {HOST.stats.responseTime}
                </span>
                <span className="text-xs text-tc-text-hint ml-1">
                  Tempo de Resposta
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
        {activeTab === "sobre" && <TabSobre />}
        {activeTab === "oportunidades" && <TabOportunidades />}
        {activeTab === "publicacoes" && <TabPublicacoes />}
        {activeTab === "avaliacoes" && <TabAvaliacoes />}
      </div>
    </div>
  );
}

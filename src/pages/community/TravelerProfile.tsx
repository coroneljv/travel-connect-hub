import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabKey = "sobre" | "experiencias" | "publicacoes" | "avaliacoes";

interface ExperienceItem {
  id: string;
  coverUrl: string;
  title: string;
  host: string;
  location: string;
  date: string;
  duration: string;
  skills: string[];
  description: string;
  badge: string;
}

interface PostItem {
  id: string;
  avatarUrl: string;
  name: string;
  date: string;
  text: string;
  imageUrl?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
}

interface ReviewItem {
  id: string;
  avatarUrl: string;
  reviewerName: string;
  reviewerRole: string;
  timeAgo: string;
  rating: number;
  text: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const TRAVELER = {
  name: "João Silva Santos",
  avatarUrl:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  coverUrl:
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1400&h=400&fit=crop",
  location: "São Paulo, Brasil",
  age: 28,
  followers: 1234,
  isVerified: true,
  isOnline: true,
  experienceCount: 9,
  averageRating: 4.9,
  languageCount: 3,
  photoCount: 3,
  galleryUrl:
    "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=900&h=500&fit=crop",
  bio: "Sou um viajante apaixonado por educação e voluntariado. Nos últimos 3 anos, tenho dedicado meu tempo a ensinar idiomas em comunidades ao redor do mundo. Acredito que a educação é a ferramenta mais poderosa para transformar vidas.",
  languages: [
    { name: "Português", level: "Nativo" },
    { name: "Inglês", level: "Fluente" },
    { name: "Espanhol", level: "Intermediário" },
  ],
  skills: ["Ensino", "Agricultura", "Chef", "Fotografia"],
  interests: ["Educação", "Sustentabilidade", "Cultura Local", "Gastronomia"],
};

const MOCK_EXPERIENCES: ExperienceItem[] = [
  {
    id: "exp-1",
    coverUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop",
    title: "Professor de Inglês para Crianças",
    host: "Chiang Mai Language School",
    location: "Chiang Mai, Tailândia",
    date: "14 de mar. de 2024",
    duration: "3 meses",
    skills: ["Ensino", "Inglês", "Educação"],
    description:
      "Ministrei aulas de inglês para crianças de 6 a 12 anos em uma escola comunitária. Desenvolvi materiais didáticos interativos e organizei atividades culturais.",
    badge: "Voluntariado",
  },
  {
    id: "exp-2",
    coverUrl:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop",
    title: "Assistente de Fazenda Orgânica",
    host: "Green Valley Farm",
    location: "Monteverde, Costa Rica",
    date: "08 de ago. de 2023",
    duration: "2 meses",
    skills: ["Agricultura", "Sustentabilidade", "Trabalho em Equipe"],
    description:
      "Auxiliei na colheita e plantio de produtos orgânicos, além de participar de workshops sobre agricultura sustentável e permacultura.",
    badge: "Voluntariado",
  },
  {
    id: "exp-3",
    coverUrl:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop",
    title: "Chef Assistente em Restaurante Local",
    host: "Trattoria Bella Napoli",
    location: "Nápoles, Itália",
    date: "20 de jan. de 2023",
    duration: "1 mês",
    skills: ["Culinária", "Gastronomia", "Cultura Local"],
    description:
      "Trabalhei como chef assistente aprendendo receitas tradicionais italianas, técnicas de preparo de massas frescas e gestão de cozinha profissional.",
    badge: "Intercâmbio",
  },
];

const MOCK_POSTS: PostItem[] = [
  {
    id: "post-1",
    avatarUrl: TRAVELER.avatarUrl,
    name: TRAVELER.name,
    date: "12 de fev. de 2024",
    text: "Acabei de completar 3 meses incríveis ensinando inglês em Chiang Mai! As crianças são simplesmente maravilhosas e aprendi tanto quanto ensinei. Gratidão imensa por essa experiência transformadora. Se você está pensando em fazer voluntariado na área de educação, recomendo demais! A comunidade local é super acolhedora e a cultura tailandesa é fascinante.",
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
    tags: ["Voluntariado", "Educação", "Tailândia"],
    likes: 47,
    comments: 12,
    shares: 5,
  },
  {
    id: "post-2",
    avatarUrl: TRAVELER.avatarUrl,
    name: TRAVELER.name,
    date: "03 de set. de 2023",
    text: "Dois meses na fazenda orgânica em Monteverde e posso dizer que mudou minha perspectiva sobre alimentação e sustentabilidade. Acordar com o som dos pássaros, colher alimentos frescos e aprender sobre permacultura foi uma experiência única. Próxima parada: Itália! 🇮🇹🌿",
    tags: ["Agricultura", "Sustentabilidade", "Costa Rica"],
    likes: 32,
    comments: 8,
    shares: 3,
  },
];

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Maria+Fernanda&background=CF3952&color=fff&size=96",
    reviewerName: "Maria Fernanda Costa",
    reviewerRole: "Anfitriã - Chiang Mai Language School",
    timeAgo: "3 meses",
    rating: 5,
    text: "João foi um voluntário excepcional! Sua dedicação com as crianças era evidente todos os dias. Ele criou materiais didáticos incríveis e as crianças adoravam suas aulas. Muito pontual, respeitoso e proativo. Recomendo fortemente para qualquer projeto educacional.",
    tags: ["Comunicação excelente", "Muito dedicado", "Pontual"],
  },
  {
    id: "rev-2",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=364763&color=fff&size=96",
    reviewerName: "Carlos Rodriguez",
    reviewerRole: "Anfitrião - Green Valley Farm",
    timeAgo: "6 meses",
    rating: 5,
    text: "Tivemos o prazer de receber o João em nossa fazenda por 2 meses. Ele se adaptou rapidamente à rotina do campo, mostrou grande interesse em aprender sobre agricultura sustentável e contribuiu significativamente com novas ideias para nosso projeto.",
    tags: ["Trabalho em equipe", "Proativo", "Aprendizado rápido"],
  },
  {
    id: "rev-3",
    avatarUrl:
      "https://ui-avatars.com/api/?name=Giulia+Bianchi&background=E8836B&color=fff&size=96",
    reviewerName: "Giulia Bianchi",
    reviewerRole: "Anfitriã - Trattoria Bella Napoli",
    timeAgo: "12 meses",
    rating: 4,
    text: "João demonstrou grande paixão pela culinária italiana. Aprendeu rapidamente as técnicas de preparo e se integrou muito bem com a equipe. É um jovem muito simpático e trabalhador. A única coisa é que poderia ter praticado mais o italiano!",
    tags: ["Simpático", "Trabalhador", "Entusiasmado"],
  },
];

const RATING_DISTRIBUTION = [
  { stars: 5, percent: 80 },
  { stars: 4, percent: 15 },
  { stars: 3, percent: 3 },
  { stars: 2, percent: 1 },
  { stars: 1, percent: 1 },
];

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

  const [activeTab, setActiveTab] = useState<TabKey>("sobre");
  const [isFollowing, setIsFollowing] = useState(true);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "sobre", label: "Sobre" },
    { key: "experiencias", label: "Experiências" },
    { key: "publicacoes", label: "Publicações" },
    { key: "avaliacoes", label: "Avaliações" },
  ];

  // ── Tab: Sobre ──

  const renderSobreTab = () => (
    <div className="space-y-6">
      {/* Photo gallery banner */}
      <div className="relative w-full rounded-xl overflow-hidden aspect-video">
        <img
          src={TRAVELER.galleryUrl}
          alt="Galeria de fotos"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-navy-500/80 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
          <Camera className="h-3.5 w-3.5" />
          {TRAVELER.photoCount} fotos
        </div>
      </div>

      {/* Sobre Mim */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
          Sobre Mim
        </h3>
        <p className="text-sm text-tc-text-secondary leading-relaxed">
          {TRAVELER.bio}
        </p>
      </div>

      {/* Idiomas */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
          Idiomas
        </h3>
        <div className="flex flex-wrap gap-2">
          {TRAVELER.languages.map((lang) => (
            <span
              key={lang.name}
              className="text-xs font-medium text-navy-500 bg-navy-50 border border-navy-200 px-3 py-1.5 rounded-full"
            >
              {lang.name} ({lang.level})
            </span>
          ))}
        </div>
      </div>

      {/* Habilidades */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
          Habilidades
        </h3>
        <div className="flex flex-wrap gap-2">
          {TRAVELER.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs font-medium text-rose-500 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Interesses */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
          Interesses
        </h3>
        <div className="flex flex-wrap gap-2">
          {TRAVELER.interests.map((interest) => (
            <span
              key={interest}
              className="text-xs font-medium text-tc-text-secondary bg-warm-gray border border-border px-3 py-1.5 rounded-full"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Tab: Experiências ──

  const renderExperienciasTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-tc-text-primary">
            Certificados de Oportunidades
          </h3>
          <p className="text-sm text-tc-text-hint mt-1">
            Experiências completadas através da plataforma ao redor do mundo
          </p>
        </div>
        <span className="text-xs font-medium text-white bg-emerald-500 px-3 py-1 rounded-full">
          8 certificados
        </span>
      </div>

      {/* Experience cards */}
      {MOCK_EXPERIENCES.map((exp) => (
        <div
          key={exp.id}
          className="border border-border rounded-xl p-4 bg-white relative"
        >
          {/* Badge top-right */}
          <span className="absolute top-4 right-4 text-[10px] font-medium text-navy-500 bg-navy-100 px-2 py-0.5 rounded-full">
            {exp.badge}
          </span>

          <div className="flex gap-4">
            {/* Cover image */}
            <img
              src={exp.coverUrl}
              alt={exp.title}
              className="w-20 h-20 rounded-lg object-cover shrink-0"
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-tc-text-primary pr-24">
                {exp.title}
              </h4>
              <p className="text-xs text-tc-text-secondary mt-0.5">
                {exp.host}
              </p>
              <p className="text-xs text-tc-text-hint flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {exp.location}
              </p>

              {/* Date + duration tags */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[11px] text-tc-text-hint bg-gray-100 px-2 py-0.5 rounded-full">
                  {exp.date}
                </span>
                <span className="text-[11px] text-tc-text-hint bg-gray-100 px-2 py-0.5 rounded-full">
                  {exp.duration}
                </span>
              </div>

              {/* Skill tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {exp.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-xs text-tc-text-secondary leading-relaxed mt-2 line-clamp-2">
                {exp.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Tab: Publicações ──

  const renderPublicacoesTab = () => (
    <div className="space-y-6">
      {MOCK_POSTS.map((post) => (
        <div
          key={post.id}
          className="border border-border rounded-xl bg-white overflow-hidden"
        >
          {/* Post header */}
          <div className="flex items-center gap-3 p-4 pb-0">
            <img
              src={post.avatarUrl}
              alt={post.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-tc-text-primary">
                {post.name}
              </p>
              <p className="text-xs text-tc-text-hint">{post.date}</p>
            </div>
          </div>

          {/* Text content */}
          <div className="px-4 pt-3">
            <p className="text-sm text-tc-text-secondary leading-relaxed">
              {post.text}
            </p>
          </div>

          {/* Image */}
          {post.imageUrl && (
            <div className="mt-3">
              <img
                src={post.imageUrl}
                alt="Post"
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 px-4 pt-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-navy-500 bg-navy-50 border border-navy-200 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Engagement row */}
          <div className="flex items-center gap-6 px-4 py-3 mt-2 border-t border-border">
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-tc-text-hint hover:text-rose-500 transition-colors"
            >
              <Heart className="h-4 w-4" />
              {post.likes}
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-tc-text-hint hover:text-navy-500 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {post.comments}
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-tc-text-hint hover:text-navy-500 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              {post.shares}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Tab: Avaliações ──

  const renderAvaliacoesTab = () => (
    <div className="space-y-6">
      {/* Rating summary */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <div className="flex items-start gap-8">
          {/* Left: big rating */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl font-bold text-tc-text-primary">
              {TRAVELER.averageRating}
            </span>
            <StarsRow rating={TRAVELER.averageRating} size="h-5 w-5" />
            <span className="text-xs text-tc-text-hint mt-1">
              12 avaliações
            </span>
          </div>

          {/* Right: distribution bars */}
          <div className="flex-1 space-y-2">
            {RATING_DISTRIBUTION.map((row) => (
              <div key={row.stars} className="flex items-center gap-2">
                <span className="text-xs text-tc-text-secondary w-4 text-right">
                  {row.stars}
                </span>
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
                <span className="text-xs text-tc-text-hint w-8 text-right">
                  {row.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review cards */}
      {MOCK_REVIEWS.map((review) => (
        <div
          key={review.id}
          className="border border-border rounded-xl p-4 bg-white space-y-3"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={review.avatarUrl}
                alt={review.reviewerName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-tc-text-primary">
                  {review.reviewerName}
                </p>
                <p className="text-xs text-tc-text-hint">
                  {review.reviewerRole} &bull; {review.timeAgo}
                </p>
              </div>
            </div>
            <StarsRow rating={review.rating} />
          </div>

          {/* Review text */}
          <p className="text-sm text-tc-text-secondary leading-relaxed">
            {review.text}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {review.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
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
        <img
          src={TRAVELER.coverUrl}
          alt="Cover"
          className="w-full h-48 object-cover rounded-none"
        />
      </div>

      {/* Profile card */}
      <div className="border border-border rounded-xl bg-white p-6 mx-auto max-w-4xl -mt-16 relative z-10">
        {/* Top row: avatar + info + action buttons */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar with online indicator */}
            <div className="relative -mt-16">
              <img
                src={TRAVELER.avatarUrl}
                alt={TRAVELER.name}
                className="w-20 h-20 rounded-xl border-4 border-white object-cover"
              />
              {TRAVELER.isOnline && (
                <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
              )}
            </div>

            {/* Name + meta */}
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-semibold text-tc-text-primary">
                  {TRAVELER.name}
                </h1>
                {TRAVELER.isVerified && (
                  <CheckCircle2 className="h-5 w-5 text-blue-500 fill-blue-500" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-tc-text-secondary">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {TRAVELER.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {TRAVELER.age} anos
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {TRAVELER.followers} seguidores
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="flex items-center justify-center w-9 h-9 rounded-full border border-border text-tc-text-secondary hover:bg-gray-50 transition-colors"
              title="Compartilhar"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              type="button"
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
            onClick={() => setIsFollowing(!isFollowing)}
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
                {TRAVELER.experienceCount}
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
                {TRAVELER.averageRating}
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
                {TRAVELER.languageCount}
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

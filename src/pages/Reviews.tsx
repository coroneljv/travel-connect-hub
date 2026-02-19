import { useState } from "react";
import { Star, ThumbsUp, MessageSquare, Edit3, MapPin, Calendar, Clock } from "lucide-react";
import ReviewModal from "@/components/modals/ReviewModal";

// ---------------------------------------------------------------------------
// Mock data — TODO: substituir por query Supabase
// ---------------------------------------------------------------------------

const MOCK_STATS = {
  averageRating: 4.9,
  received: 3,
  given: 2,
  pending: 1,
};

const MOCK_PENDING = {
  title: "Hostel Receptionist",
  type: "Voluntariado",
  location: "Florianópolis, SC",
  travelerName: "Yuki Tanaka",
  travelerFlag: "🇯🇵",
  travelerAvatar:
    "https://ui-avatars.com/api/?name=Yuki+Tanaka&background=364763&color=fff&size=96",
  hostName: "por Luciane",
  date: "14/11/2025",
  endDate: "Finalizada em 09/12/2024",
};

const MOCK_RECEIVED_REVIEWS = [
  {
    id: "1",
    reviewerName: "Lívia Nunes Teixeira",
    reviewerRole: "Recepcionista de Hostel na Praia",
    reviewerAvatar:
      "https://ui-avatars.com/api/?name=Livia+Nunes&background=E8836B&color=fff&size=96",
    location: "Florianópolis, SC",
    date: "14/11/2025",
    overallRating: 4.8,
    categories: [
      { name: "Comunicação", rating: 5 },
      { name: "Qualidade", rating: 5 },
      { name: "Confiabilidade", rating: 5 },
      { name: "Trabalho em Equipe", rating: 5 },
      { name: "Iniciativa", rating: 4 },
    ],
    text: "Experiência incrível! O Rafael e toda equipe foram extremamente acolhedores desde o primeiro dia. O ambiente de trabalho é profissional mas descontraído. A localização é perfeita, pertinho da praia. Aprendi muito sobre gestão de hostel e fiz amigos do mundo inteiro. Super recomendo!",
    wouldReturn: true,
  },
];

const MOCK_MY_REVIEWS = [
  {
    id: "2",
    reviewerName: "Lívia Nunes Teixeira",
    reviewerRole: "Recepcionista de Hostel na Praia",
    reviewerAvatar:
      "https://ui-avatars.com/api/?name=Livia+Nunes&background=E8836B&color=fff&size=96",
    location: "Fernando de Noronha, Pernambuco",
    date: "14/11/2025",
    duration: "1 mês",
    overallRating: 4.8,
    categories: [
      { name: "Comunicação", rating: 5 },
      { name: "Qualidade", rating: 5 },
      { name: "Confiabilidade", rating: 5 },
      { name: "Trabalho em Equipe", rating: 5 },
      { name: "Iniciativa", rating: 4 },
    ],
    text: "Lívia foi excepcional! Sempre pontual, proativa e com uma energia contagiante. Os hóspedes adoravam conversar com ela e sua fluência em inglês foi um grande diferencial. Recomendamos 100% para outros anfitriões. Seria um prazer recebê-la novamente!",
    strengths: ["Comunicação", "Pontualidade", "Proatividade"],
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StarsDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-4 w-4 ${
            s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function CategoryBadge({ name, rating }: { name: string; rating: number }) {
  return (
    <div className="flex flex-col items-center gap-1 border border-border rounded-lg px-4 py-2 bg-white">
      <span className="text-xs text-tc-text-secondary">{name}</span>
      <span className="flex items-center gap-1 text-sm font-medium text-tc-text-primary">
        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
        {rating}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function Reviews() {
  const [activeTab, setActiveTab] = useState<"received" | "my">("received");
  const [showReviewModal, setShowReviewModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-tc-text-primary">Avaliações</h1>
        <p className="text-sm text-tc-text-hint">
          Veja suas avaliações e avalie viajantes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Avaliação Média", value: MOCK_STATS.averageRating.toString(), Icon: Star, color: "text-amber-500" },
          { label: "Recebidas", value: MOCK_STATS.received.toString(), Icon: ThumbsUp, color: "text-navy-500" },
          { label: "Feitas", value: MOCK_STATS.given.toString(), Icon: MessageSquare, color: "text-navy-500" },
          { label: "Pendentes", value: MOCK_STATS.pending.toString(), Icon: Edit3, color: "text-navy-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between border border-border rounded-lg p-4 bg-white"
          >
            <div>
              <p className="text-xs text-tc-text-hint">{stat.label}</p>
              <p className="text-2xl font-bold text-tc-text-primary">{stat.value}</p>
            </div>
            <stat.Icon className={`h-6 w-6 ${stat.color}`} />
          </div>
        ))}
      </div>

      {/* Pending review */}
      <div className="border border-border rounded-lg p-4 bg-white">
        <p className="text-sm font-semibold text-tc-text-primary flex items-center gap-2 mb-3">
          <Clock className="h-4 w-4 text-tc-text-hint" />
          Pendente de Avaliação
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={MOCK_PENDING.travelerAvatar}
              alt={MOCK_PENDING.travelerName}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-tc-text-primary">
                  {MOCK_PENDING.title}
                </p>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-tc-text-secondary">
                  {MOCK_PENDING.type}
                </span>
              </div>
              <p className="text-xs text-tc-text-hint">
                Viajante: {MOCK_PENDING.travelerName} {MOCK_PENDING.travelerFlag}
              </p>
            </div>
          </div>
          <div className="text-xs text-tc-text-hint text-right">
            <p className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {MOCK_PENDING.location}
            </p>
            <p className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {MOCK_PENDING.date}
            </p>
          </div>
          <div className="text-xs text-tc-text-hint text-right">
            <p>{MOCK_PENDING.hostName}</p>
            <p>{MOCK_PENDING.endDate}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-gray-50 transition-colors text-tc-text-primary"
          >
            <Star className="h-3.5 w-3.5" />
            Avaliar Agora
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="grid grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setActiveTab("received")}
          className={`flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "received"
              ? "bg-rose-500 text-white"
              : "bg-white text-tc-text-secondary hover:bg-gray-50"
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          Recebidas
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("my")}
          className={`flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            activeTab === "my"
              ? "bg-navy-500 text-white"
              : "bg-white text-tc-text-secondary hover:bg-gray-50"
          }`}
        >
          <Edit3 className="h-4 w-4" />
          Minhas Avaliações
        </button>
      </div>

      {/* Review cards */}
      {activeTab === "received" ? (
        <div className="space-y-4">
          {MOCK_RECEIVED_REVIEWS.map((review) => (
            <div key={review.id} className="border border-border rounded-lg p-5 bg-white space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={review.reviewerAvatar} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-tc-text-primary">{review.reviewerName}</p>
                    <p className="text-xs text-tc-text-hint">{review.reviewerRole}</p>
                    <div className="flex items-center gap-3 text-xs text-tc-text-hint mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {review.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {review.date}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <StarsDisplay rating={review.overallRating} />
                  <p className="text-xs text-tc-text-hint mt-1">{review.overallRating} de 5.0</p>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-semibold text-tc-text-primary mb-2">
                  Avaliação por Categoria
                </p>
                <div className="flex gap-2 flex-wrap">
                  {review.categories.map((cat) => (
                    <CategoryBadge key={cat.name} name={cat.name} rating={cat.rating} />
                  ))}
                </div>
              </div>

              {/* Text */}
              <p className="text-sm text-tc-text-secondary leading-relaxed">
                {review.text}
              </p>

              {/* Would return */}
              {review.wouldReturn && (
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Retornaria a este anfitrião
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {MOCK_MY_REVIEWS.map((review) => (
            <div key={review.id} className="border border-border rounded-lg p-5 bg-white space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img src={review.reviewerAvatar} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-sm font-medium text-tc-text-primary">{review.reviewerName}</p>
                    <p className="text-xs text-tc-text-hint">{review.reviewerRole}</p>
                    <div className="flex items-center gap-3 text-xs text-tc-text-hint mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {review.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {review.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {review.duration}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <StarsDisplay rating={review.overallRating} />
                  <p className="text-xs text-tc-text-hint mt-1">{review.overallRating} de 5.0</p>
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-xs font-semibold text-tc-text-primary mb-2">
                  Avaliação por Categoria
                </p>
                <div className="flex gap-2 flex-wrap">
                  {review.categories.map((cat) => (
                    <CategoryBadge key={cat.name} name={cat.name} rating={cat.rating} />
                  ))}
                </div>
              </div>

              {/* Text */}
              <p className="text-sm text-tc-text-secondary leading-relaxed">
                {review.text}
              </p>

              {/* Strengths */}
              {review.strengths && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-tc-text-hint">Pontos Fortes:</span>
                  {review.strengths.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 text-xs rounded-full bg-tc-blue-bg text-tc-blue-text border border-transparent"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        opportunity={{
          title: MOCK_PENDING.title,
          type: MOCK_PENDING.type,
          travelerName: MOCK_PENDING.travelerName,
          travelerFlag: MOCK_PENDING.travelerFlag,
          travelerAvatar: MOCK_PENDING.travelerAvatar,
        }}
      />
    </div>
  );
}

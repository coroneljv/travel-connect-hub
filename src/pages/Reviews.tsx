import { useState, useEffect } from "react";
import { Star, ThumbsUp, MessageSquare, Edit3, MapPin, Calendar, Clock } from "lucide-react";
import ReviewModal from "@/components/modals/ReviewModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewRow {
  id: string;
  overall_rating: number;
  communication_rating: number | null;
  quality_rating: number | null;
  reliability_rating: number | null;
  teamwork_rating: number | null;
  proactivity_rating: number | null;
  comment: string | null;
  would_accept_again: boolean | null;
  created_at: string | null;
  reviewer_id: string;
  reviewed_id: string;
  request_id: string | null;
  reviewer_profile?: { full_name: string; avatar_url: string | null; position: string | null } | null;
  reviewed_profile?: { full_name: string; avatar_url: string | null; position: string | null } | null;
  request?: { title: string; destination: string | null } | null;
}

interface MappedReview {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerAvatar: string;
  location: string;
  date: string;
  duration?: string;
  overallRating: number;
  categories: { name: string; rating: number }[];
  text: string;
  wouldReturn?: boolean;
  strengths?: string[];
}

function mapReviewRow(row: ReviewRow, isReceived: boolean): MappedReview {
  const profile = isReceived ? row.reviewer_profile : row.reviewed_profile;
  const name = profile?.full_name ?? "Usuário";
  const avatar = profile?.avatar_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=364763&color=fff&size=96`;

  const categories: { name: string; rating: number }[] = [];
  if (row.communication_rating) categories.push({ name: "Comunicação", rating: row.communication_rating });
  if (row.quality_rating) categories.push({ name: "Qualidade", rating: row.quality_rating });
  if (row.reliability_rating) categories.push({ name: "Confiabilidade", rating: row.reliability_rating });
  if (row.teamwork_rating) categories.push({ name: "Trabalho em Equipe", rating: row.teamwork_rating });
  if (row.proactivity_rating) categories.push({ name: "Iniciativa", rating: row.proactivity_rating });

  const createdAt = row.created_at ? new Date(row.created_at) : new Date();
  const dateStr = createdAt.toLocaleDateString("pt-BR");

  return {
    id: row.id,
    reviewerName: name,
    reviewerRole: profile?.position ?? row.request?.title ?? "Viajante",
    reviewerAvatar: avatar,
    location: row.request?.destination ?? "",
    date: dateStr,
    overallRating: row.overall_rating,
    categories,
    text: row.comment ?? "",
    wouldReturn: row.would_accept_again ?? undefined,
  };
}

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
  const { user } = useAuth();

  const [receivedReviews, setReceivedReviews] = useState<MappedReview[]>([]);
  const [myReviews, setMyReviews] = useState<MappedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchReviews() {
      setLoading(true);

      // Reviews received (where I am reviewed_id)
      const { data: received } = await supabase
        .from("reviews")
        .select("*, reviewer_profile:profiles!reviews_reviewer_id_fkey(full_name, avatar_url, position), request:requests!reviews_request_id_fkey(title, destination)")
        .eq("reviewed_id", user!.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      // Reviews given (where I am reviewer_id)
      const { data: given } = await supabase
        .from("reviews")
        .select("*, reviewed_profile:profiles!reviews_reviewed_id_fkey(full_name, avatar_url, position), request:requests!reviews_request_id_fkey(title, destination)")
        .eq("reviewer_id", user!.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      setReceivedReviews((received ?? []).map((r: any) => mapReviewRow(r, true)));
      setMyReviews((given ?? []).map((r: any) => mapReviewRow(r, false)));
      setLoading(false);
    }

    fetchReviews();
  }, [user]);

  const avgRating = receivedReviews.length > 0
    ? (receivedReviews.reduce((sum, r) => sum + r.overallRating, 0) / receivedReviews.length).toFixed(1)
    : "0";
  const stats = {
    averageRating: avgRating,
    received: receivedReviews.length.toString(),
    given: myReviews.length.toString(),
    pending: "0",
  };

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
          { label: "Avaliação Média", value: stats.averageRating, Icon: Star, color: "text-amber-500" },
          { label: "Recebidas", value: stats.received, Icon: ThumbsUp, color: "text-navy-500" },
          { label: "Feitas", value: stats.given, Icon: MessageSquare, color: "text-navy-500" },
          { label: "Pendentes", value: stats.pending, Icon: Edit3, color: "text-navy-500" },
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-border rounded-lg">
          <p className="text-tc-text-hint text-sm">Carregando avaliações...</p>
        </div>
      ) : activeTab === "received" ? (
        receivedReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-border rounded-lg">
            <p className="text-tc-text-hint text-sm">Nenhuma avaliação recebida</p>
          </div>
        ) : (
        <div className="space-y-4">
          {receivedReviews.map((review) => (
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
        )
      ) : (
        myReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-border rounded-lg">
            <p className="text-tc-text-hint text-sm">Nenhuma avaliação feita</p>
          </div>
        ) : (
        <div className="space-y-4">
          {myReviews.map((review) => (
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
        )
      )}

      {/* Review Modal */}
      <ReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        opportunity={{
          title: "",
          type: "",
          travelerName: "",
          travelerFlag: "",
          travelerAvatar: "",
        }}
      />
    </div>
  );
}

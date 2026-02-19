import { useState } from "react";
import { Star, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  /** Info about the opportunity/traveler being reviewed */
  opportunity?: {
    title: string;
    type: string;
    travelerName: string;
    travelerFlag: string;
    travelerAvatar: string;
  };
}

const CATEGORIES = [
  "Confiabilidade",
  "Qualidade do Trabalho",
  "Comunicação",
  "Proatividade",
  "Respeito às Regras",
  "Trabalho em Equipe",
];

// ---------------------------------------------------------------------------
// Star Rating Sub-component
// ---------------------------------------------------------------------------

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="p-0.5 transition-colors"
        >
          <Star
            className={`h-5 w-5 ${
              star <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReviewModal({
  open,
  onClose,
  opportunity,
}: ReviewModalProps) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [wouldAcceptAgain, setWouldAcceptAgain] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateRating = (category: string, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    const allRated = CATEGORIES.every((c) => ratings[c] && ratings[c] > 0);
    if (!allRated) {
      toast.error("Avalie todas as categorias antes de enviar.");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: integrar com Supabase — inserir avaliação
      await new Promise((r) => setTimeout(r, 1000));
      toast.success("Avaliação enviada com sucesso!");
      onClose();
      // Reset
      setRatings({});
      setWouldAcceptAgain(null);
    } catch {
      toast.error("Erro ao enviar avaliação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const info = opportunity ?? {
    title: "Recepcionista de Hotel na Praia",
    type: "Voluntariado",
    travelerName: "Yuki Tanaka",
    travelerFlag: "🇯🇵",
    travelerAvatar:
      "https://ui-avatars.com/api/?name=Yuki+Tanaka&background=364763&color=fff&size=96",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 rounded-lg overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-bold text-tc-text-primary">
            Avaliar Viajante
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Opportunity card */}
          <div className="flex items-center gap-3 border border-border rounded-lg p-3">
            <img
              src={info.travelerAvatar}
              alt={info.travelerName}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-tc-text-primary truncate">
                  {info.title}
                </p>
                <span className="shrink-0 px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-tc-text-secondary">
                  {info.type}
                </span>
              </div>
              <p className="text-xs text-tc-text-hint">
                Viajante: {info.travelerName} {info.travelerFlag}
              </p>
            </div>
          </div>

          {/* Category ratings */}
          <div>
            <p className="text-sm font-semibold text-tc-text-primary mb-3">
              Avaliação por Categoria<span className="text-rose-500">*</span>
            </p>
            <div className="space-y-0">
              {CATEGORIES.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                >
                  <span className="text-sm text-tc-text-primary">{category}</span>
                  <StarRating
                    value={ratings[category] ?? 0}
                    onChange={(v) => updateRating(category, v)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Would accept again */}
          <div>
            <p className="text-sm font-semibold text-tc-text-primary mb-2">
              Você aceitaria novamente esse viajante?<span className="text-rose-500">*</span>
            </p>
            <div className="flex gap-3">
              {[
                { label: "Sim", value: true },
                { label: "Não", value: false },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setWouldAcceptAgain(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    wouldAcceptAgain === opt.value
                      ? "border-navy-500 bg-navy-50 text-navy-500"
                      : "border-border bg-white text-tc-text-secondary hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-3 rounded-lg border border-border text-tc-text-primary font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="py-3 rounded-lg font-medium text-white bg-navy-500 hover:bg-navy-600 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

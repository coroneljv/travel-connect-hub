import { X, Clock, Languages, Star, Wrench } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DURATIONS = ["Curta (1 a 4 semanas)", "Média (1 a 3 meses)", "Longa (3+ meses)"];
const LANGUAGES = ["Inglês", "Espanhol", "Português"];
const SKILLS_COL = [
  ["Inglês", "Espanhol"],
  ["Alemão", "Atendimento Cliente"],
  ["Cozinha", "Limpeza"],
];
const RATINGS = ["4.5+", "4+", "3.5+"];

function FilterOption({ label }: { label: string }) {
  return (
    <button className="w-full text-left px-4 py-[11px] rounded-md border border-border bg-white text-base text-tc-text-secondary hover:bg-muted transition-colors">
      {label}
    </button>
  );
}

function RatingOption({ label }: { label: string }) {
  return (
    <button className="w-full text-left px-4 py-[11px] rounded-md border border-border bg-white hover:bg-muted transition-colors flex items-center gap-3">
      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
      <span className="text-base text-tc-text-secondary">{label}</span>
    </button>
  );
}

export default function OpportunityFilters({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="bg-white border border-border rounded-md p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-base font-medium text-tc-text-primary">
          Filtros Avançados
        </span>
        <button onClick={onClose} className="text-tc-text-hint hover:text-tc-text-primary">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Grid 2-col: Duration + Languages */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-tc-text-primary" />
            <span className="text-sm font-medium text-tc-text-primary">Duração</span>
          </div>
          <div className="space-y-2">
            {DURATIONS.map((d) => (
              <FilterOption key={d} label={d} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-tc-text-primary" />
            <span className="text-sm font-medium text-tc-text-primary">Idiomas</span>
          </div>
          <div className="space-y-2">
            {LANGUAGES.map((l) => (
              <FilterOption key={l} label={l} />
            ))}
          </div>
        </div>
      </div>

      {/* Grid 2-col: Skills + Rating */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-tc-text-primary" />
            <span className="text-sm font-medium text-tc-text-primary">Habilidades</span>
          </div>
          <div className="space-y-2">
            {SKILLS_COL.map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                {row.map((s) => (
                  <FilterOption key={s} label={s} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-tc-text-primary" />
            <span className="text-sm font-medium text-tc-text-primary">Avaliação Mínima</span>
          </div>
          <div className="space-y-2">
            {RATINGS.map((r) => (
              <RatingOption key={r} label={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

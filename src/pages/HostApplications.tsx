import { useState } from "react";
import { Search, Building2, Clock, CheckCircle2, Star, Eye, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Mock data — TODO: substituir por query Supabase
// ---------------------------------------------------------------------------

const MOCK_STATS = {
  opportunities: 12,
  pending: 4,
  accepted: 3,
  rejected: 1,
};

const MOCK_CANDIDATES = [
  {
    id: "1",
    name: "Emma Wilson",
    age: 30,
    location: "UK",
    rating: 5,
    reviewCount: 24,
    status: "pending" as const,
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=200&fit=crop",
    avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=364763&color=fff&size=96",
    matchPercent: 75,
    liked: true,
    opportunityTitle: "Voluntariado no Eco Lodge",
    opportunityLocation: "San Diego, Califórnia",
    languages: ["Germânico", "Inglês"],
    skills: ["Marketing Digital", "Ensinar", "Atendimento ao Cliente", "Redes Sociais"],
    requiredSkills: [
      { name: "Atendimento ao Cliente", met: true },
      { name: "Comunicação", met: false },
    ],
    optionalSkills: [
      { name: "Redes Sociais", met: true },
      { name: "Fotografia", met: false },
      { name: "Experiência Hotel", met: false },
    ],
    applicationDate: "10/12/2025",
    desiredStart: "10/01/2026",
    duration: "3 meses",
    message:
      "Tenho uma vasta experiência a trabalhar com animais e adoraria ajudar a cuidar das suas galinhas, cabras e abelhas. Também sou instrutora de ioga certificada.",
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HostApplications() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = MOCK_CANDIDATES.filter((c) =>
    c.opportunityTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-tc-text-primary">
          Todas as Candidaturas
        </h1>
        <p className="text-sm text-tc-text-hint">
          Gerencia todas as candidaturas recebidas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Oportunidades", value: MOCK_STATS.opportunities, Icon: Building2, color: "text-navy-500" },
          { label: "Pendentes", value: MOCK_STATS.pending, Icon: Clock, color: "text-amber-500" },
          { label: "Aceitas", value: MOCK_STATS.accepted, Icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Rejeitadas", value: MOCK_STATS.rejected, Icon: Star, color: "text-tc-text-hint" },
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

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <Input
            placeholder="Buscar por nome da oportunidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Candidate cards */}
      {filteredCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-border rounded-lg">
          <p className="text-tc-text-hint text-sm">Nenhuma candidatura encontrada</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-white border border-border rounded-lg overflow-hidden">
              {/* Cover image */}
              <div className="relative h-40">
                <img
                  src={candidate.coverImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* Match + Like badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-500 text-white">
                    ⚡ {candidate.matchPercent}%
                  </span>
                  {candidate.liked && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-rose-500 text-white">
                      ⚡ Like
                    </span>
                  )}
                </div>
                {/* Opportunity info */}
                <div className="absolute bottom-3 right-3 bg-navy-500/90 text-white px-3 py-1.5 rounded-lg text-right">
                  <p className="text-xs font-medium">{candidate.opportunityTitle}</p>
                  <p className="text-[10px] opacity-80 flex items-center justify-end gap-1">
                    <MapPin className="h-3 w-3" />
                    {candidate.opportunityLocation}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-tc-text-primary">
                        {candidate.name}, {candidate.age}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-tc-text-hint">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {candidate.location}
                        </span>
                        <span>⭐ {candidate.rating} ({candidate.reviewCount} avaliações)</span>
                      </div>
                      <span className="text-xs font-medium text-rose-500">
                        {candidate.status === "pending" ? "Pendente" : candidate.status === "accepted" ? "Aceita" : "Rejeitada"}
                      </span>
                    </div>
                  </div>

                  {/* Dates card */}
                  <div className="border border-border rounded-lg p-3 text-xs space-y-1">
                    <p><span className="text-tc-text-hint">Data da Candidatura</span><br />📅 {candidate.applicationDate}</p>
                    <p><span className="text-tc-text-hint">Início Desejado</span><br />📅 {candidate.desiredStart}</p>
                    <p><span className="text-tc-text-hint">Duração</span><br />⏱️ {candidate.duration}</p>
                  </div>
                </div>

                {/* Languages + Skills */}
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-tc-text-hint">Idiomas</span>
                    <div className="flex gap-2 mt-1">
                      {candidate.languages.map((lang) => (
                        <span key={lang} className="text-xs text-tc-text-primary">{lang}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-tc-text-hint">Habilidades</span>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {candidate.skills.map((skill) => (
                        <span key={skill} className="text-xs text-tc-text-primary">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs font-medium text-tc-text-primary flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                      Requisitos Obrigatórios
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {candidate.requiredSkills.map((s) => (
                        <span
                          key={s.name}
                          className={`px-2 py-1 text-xs rounded-full border ${
                            s.met
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-gray-50 border-border text-tc-text-secondary"
                          }`}
                        >
                          {s.met ? "✓" : "✓"} {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-tc-text-primary flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-navy-500 inline-block" />
                      Opcionais
                    </p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {candidate.optionalSkills.map((s) => (
                        <span
                          key={s.name}
                          className={`px-2 py-1 text-xs rounded-full border ${
                            s.met
                              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                              : "bg-gray-50 border-border text-tc-text-secondary"
                          }`}
                        >
                          ☆ {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className="border border-border rounded-lg p-4">
                  <p className="text-xs text-tc-text-hint mb-1">✉ Mensagem do candidato</p>
                  <p className="text-sm text-tc-text-secondary leading-relaxed">
                    {candidate.message}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-tc-text-secondary border border-border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Ver Perfil Completo
                  </button>
                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Aceitar
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      ✗ Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

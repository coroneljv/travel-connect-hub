import { useState, useEffect } from "react";
import { Search, Building2, Clock, CheckCircle2, Star, Eye, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProposalCandidate {
  id: string;
  name: string;
  status: string;
  opportunityTitle: string;
  message: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HostApplications() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<ProposalCandidate[]>([]);
  const [stats, setStats] = useState({ opportunities: 0, pending: 0, accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function fetchProposals() {
      setLoading(true);

      // Get requests owned by the current user
      const { data: myRequests } = await supabase
        .from("requests")
        .select("id, title")
        .eq("created_by", user!.id)
        .is("deleted_at", null);

      const requestIds = (myRequests ?? []).map((r) => r.id);
      const requestMap = Object.fromEntries((myRequests ?? []).map((r) => [r.id, r.title]));

      if (requestIds.length === 0) {
        setStats({ opportunities: 0, pending: 0, accepted: 0, rejected: 0 });
        setCandidates([]);
        setLoading(false);
        return;
      }

      // Get proposals for those requests
      const { data: proposals } = await supabase
        .from("proposals")
        .select("*, profile:profiles!proposals_supplier_profile_id_fkey(full_name)")
        .in("request_id", requestIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      const mapped: ProposalCandidate[] = (proposals ?? []).map((p: any) => ({
        id: p.id,
        name: p.profile?.full_name ?? "Candidato",
        status: p.status,
        opportunityTitle: requestMap[p.request_id] ?? "Oportunidade",
        message: p.message,
        created_at: p.created_at,
      }));

      setCandidates(mapped);
      setStats({
        opportunities: requestIds.length,
        pending: mapped.filter((c) => c.status === "pending").length,
        accepted: mapped.filter((c) => c.status === "accepted").length,
        rejected: mapped.filter((c) => c.status === "rejected").length,
      });
      setLoading(false);
    }

    fetchProposals();
  }, [user]);

  const filteredCandidates = candidates.filter((c) =>
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
          { label: "Oportunidades", value: stats.opportunities, Icon: Building2, color: "text-navy-500" },
          { label: "Pendentes", value: stats.pending, Icon: Clock, color: "text-amber-500" },
          { label: "Aceitas", value: stats.accepted, Icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Rejeitadas", value: stats.rejected, Icon: Star, color: "text-tc-text-hint" },
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-border rounded-lg">
          <p className="text-tc-text-hint text-sm">Carregando candidaturas...</p>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-border rounded-lg">
          <p className="text-tc-text-hint text-sm">Nenhuma candidatura recebida</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-white border border-border rounded-lg overflow-hidden">
              {/* Body */}
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  {/* Avatar + info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=364763&color=fff&size=96`}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-tc-text-primary">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-tc-text-hint">
                        {candidate.opportunityTitle}
                      </p>
                      <span className="text-xs font-medium text-rose-500">
                        {candidate.status === "pending" ? "Pendente" : candidate.status === "accepted" ? "Aceita" : "Rejeitada"}
                      </span>
                    </div>
                  </div>

                  {/* Dates card */}
                  <div className="border border-border rounded-lg p-3 text-xs space-y-1">
                    <p><span className="text-tc-text-hint">Data da Candidatura</span><br />{new Date(candidate.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>

                {/* Message */}
                {candidate.message && (
                  <div className="border border-border rounded-lg p-4">
                    <p className="text-xs text-tc-text-hint mb-1">Mensagem do candidato</p>
                    <p className="text-sm text-tc-text-secondary leading-relaxed">
                      {candidate.message}
                    </p>
                  </div>
                )}

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
                      Rejeitar
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

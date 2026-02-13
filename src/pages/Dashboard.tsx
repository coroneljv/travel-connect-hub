
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Search,
  Users,
  Star,
  Heart,
  CheckCircle2,
  Zap,
  GraduationCap,
  BookOpen,
  Video,
  DollarSign,
  Calendar,
  ChevronRight,
  Plus,
  ArrowRight,
  Briefcase,
  FileText,
} from "lucide-react";
import { dbRoleToUIRole, ROLE_CONFIG } from "@/lib/roles";

/* ------------------------------------------------------------------ */
/*  Viajante (traveler) dashboard                                     */
/* ------------------------------------------------------------------ */
function ViajanteDashboard({
  profile,
  requestCount,
  proposalCount,
  openRequests,
  recentRequests,
}: {
  profile: { full_name: string; avatar_url?: string | null } | null;
  requestCount: number;
  proposalCount: number;
  openRequests: number;
  recentRequests: any[];
}) {
  const firstName = profile?.full_name?.split(" ")[0] ?? "Viajante";
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "VI";

  const stats = [
    { label: "Candidaturas Ativas", value: 12, icon: Calendar, color: "text-navy-500" },
    { label: "Oportunidades Salvas", value: 23, icon: Heart, color: "text-rose-500" },
    { label: "Avaliacao Media", value: "4.9", icon: Star, color: "text-yellow-500" },
    { label: "Experiencias Concluidas", value: 7, icon: CheckCircle2, color: "text-emerald-500" },
  ];

  const quickLinks = [
    {
      title: "Academia de Viajantes",
      icon: GraduationCap,
      description: "Cursos e certificacoes",
      meta: "120+ cursos disponiveis",
    },
    {
      title: "Meus Cursos",
      icon: BookOpen,
      description: "Gerencie seus cursos",
      meta: "3 cursos publicados",
    },
    {
      title: "Criar Novo Curso",
      icon: Video,
      description: "Compartilhe conhecimento",
      meta: "Monetize suas experiencias",
    },
    {
      title: "Integracao Bancaria",
      icon: DollarSign,
      description: "Receba pagamentos",
      meta: "1 banco vinculado",
    },
  ];

  const recentActivity = [
    { text: "Candidatura enviada para Eco Lodge - Costa Rica", time: "2h atras" },
    { text: "Perfil visualizado por 3 anfitrioes", time: "5h atras" },
    { text: "Novo match: Fazenda Organica - Portugal", time: "1d atras" },
    { text: "Avaliacao recebida: 5 estrelas", time: "2d atras" },
  ];

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-navy-100 text-navy-700 text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Ola, {firstName}! 👋
                  </h1>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="bg-navy-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Viajante
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Sao Paulo, Brasil
                  </span>
                  <span className="text-sm text-muted-foreground">
                    · Membro desde Janeiro 2024
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold">5 Creditos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Profile completion ---- */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">Complete seu Perfil</h3>
            <span className="text-sm text-muted-foreground">85%</span>
          </div>
          <Progress value={85} className="h-2 [&>div]:bg-rose-500" />
          <p className="text-xs text-muted-foreground mt-2">
            Complete seu perfil para receber mais matches!
          </p>
        </CardContent>
      </Card>

      {/* ---- Stats row ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold mt-3">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Feature cards ---- */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/opportunities">
          <Card className="bg-navy-50 border-navy-100 hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-5 w-5 text-navy-500" />
                    <h3 className="font-semibold text-navy-700">
                      Descobrir Oportunidades
                    </h3>
                  </div>
                  <p className="text-sm text-navy-500">
                    Explore +500 vagas ao redor do mundo
                  </p>
                  <p className="text-xs text-navy-400 mt-1">
                    23 novas hoje · 94% match disponivel
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-navy-400 mt-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/community">
          <Card className="bg-rose-50 border-rose-100 hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-rose-500" />
                    <h3 className="font-semibold text-rose-700">
                      Descobrir Comunidade
                    </h3>
                  </div>
                  <p className="text-sm text-rose-500">
                    Conecte-se com viajantes e anfitrioes
                  </p>
                  <p className="text-xs text-rose-400 mt-1">
                    2,847 viajantes ativos · 156 online agora
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-rose-400 mt-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ---- Quick-link cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((ql) => (
          <Card
            key={ql.title}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardContent className="p-5">
              <ql.icon className="h-6 w-6 text-rose-500 mb-3" />
              <h4 className="text-sm font-semibold">{ql.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {ql.description}
              </p>
              <p className="text-xs text-rose-500 font-medium mt-2">
                {ql.meta}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Candidaturas Recentes + Atividade Recente ---- */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Candidaturas Recentes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Candidaturas Recentes</h3>
              <Link
                to="/proposals"
                className="text-xs text-navy-500 hover:underline flex items-center gap-1"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {recentRequests.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma candidatura recente.
                </p>
              )}
              {recentRequests.map((req: any) => (
                <div key={req.id} className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-navy-50 flex items-center justify-center text-navy-600 font-medium text-xs">
                    {req.title?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{req.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.destination} · {req.status}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Atividade Recente</h3>
            <div className="space-y-4">
              {recentActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-2 w-2 rounded-full bg-navy-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Anfitriao (host) dashboard                                        */
/* ------------------------------------------------------------------ */
function AnfitriaoDashboard({
  profile,
  requestCount,
  proposalCount,
  openRequests,
  recentRequests,
}: {
  profile: { full_name: string; avatar_url?: string | null } | null;
  requestCount: number;
  proposalCount: number;
  openRequests: number;
  recentRequests: any[];
}) {
  const firstName = profile?.full_name?.split(" ")[0] ?? "Anfitriao";
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AN";

  const stats = [
    { label: "Candidaturas", value: requestCount || 12, icon: FileText, color: "text-rose-500" },
    { label: "Oportunidades", value: openRequests || 5, icon: Briefcase, color: "text-navy-500" },
    { label: "Avaliacoes", value: "4.9", icon: Star, color: "text-yellow-500" },
  ];

  const mockCandidaturas = [
    {
      name: "Maria Silva",
      status: "Pendente",
      badgeClass: "bg-yellow-100 text-yellow-700",
      initials: "MS",
    },
    {
      name: "John Anderson",
      status: "Recusado",
      badgeClass: "bg-red-100 text-red-700",
      initials: "JA",
    },
    {
      name: "Sophie Laurent",
      status: "Aceita",
      badgeClass: "bg-green-100 text-green-700",
      initials: "SL",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-rose-100 text-rose-700 text-lg font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Ola, {firstName}! 👋
                  </h1>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Anfitriao
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Sao Paulo, Brasil
                  </span>
                  <span className="text-sm text-muted-foreground">
                    · Membro desde Janeiro 2024
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- CTA Banner ---- */}
      <Link to="/requests/new">
        <Card className="bg-gradient-to-r from-rose-500 to-rose-600 border-0 hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Criar Nova Oportunidade
                  </h3>
                  <p className="text-sm text-white/80">
                    Publique uma nova vaga e comece a receber candidatos
                  </p>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* ---- Integration card ---- */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-emerald-500" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold">Integracao Bancaria</h4>
              <p className="text-xs text-muted-foreground">
                Receba pagamentos
              </p>
            </div>
            <span className="text-xs text-emerald-600 font-medium">
              1 banco vinculado
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ---- Stats row ---- */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold mt-3">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Candidaturas Recentes ---- */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Candidaturas Recentes</h3>
            <Link
              to="/proposals"
              className="text-xs text-rose-500 hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {mockCandidaturas.map((c) => (
              <div key={c.name} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-rose-50 text-rose-600 text-xs font-medium">
                    {c.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.name}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${c.badgeClass}`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard – role switch                                      */
/* ------------------------------------------------------------------ */
const Dashboard = () => {
  const { profile, organization, userRole, uiRole } = useAuth();

  /* ---- existing Supabase queries ---- */
  const { data: requestCount = 0 } = useQuery({
    queryKey: ["dashboard-requests", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return 0;
      const { count } = await supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organization.id);
      return count ?? 0;
    },
    enabled: !!organization?.id,
  });

  const { data: proposalCount = 0 } = useQuery({
    queryKey: ["dashboard-proposals", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return 0;
      const { count } = await supabase
        .from("proposals")
        .select("*", { count: "exact", head: true })
        .eq("supplier_org_id", organization.id)
        .eq("status", "pending");
      return count ?? 0;
    },
    enabled: !!organization?.id && userRole === "supplier",
  });

  const { data: openRequests = 0 } = useQuery({
    queryKey: ["dashboard-open-requests"],
    queryFn: async () => {
      const { count } = await supabase
        .from("requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");
      return count ?? 0;
    },
  });

  const { data: recentRequests = [] } = useQuery({
    queryKey: ["dashboard-recent", organization?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("requests")
        .select("id, title, destination, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  /* ---- Render the role-specific dashboard ---- */
  if (uiRole === "anfitriao") {
    return (
      <AnfitriaoDashboard
        profile={profile}
        requestCount={requestCount}
        proposalCount={proposalCount}
        openRequests={openRequests}
        recentRequests={recentRequests}
      />
    );
  }

  /* Default: viajante dashboard */
  return (
    <ViajanteDashboard
      profile={profile}
      requestCount={requestCount}
      proposalCount={proposalCount}
      openRequests={openRequests}
      recentRequests={recentRequests}
    />
  );
};

export default Dashboard;

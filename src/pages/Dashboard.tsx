
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
  Bell,
  MessageSquare,
  Settings,
  LogOut,
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
  onSignOut,
}: {
  profile: { full_name: string; avatar_url?: string | null } | null;
  requestCount: number;
  proposalCount: number;
  openRequests: number;
  onSignOut: () => void;
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

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-semibold">5 Creditos</span>
              </div>
              <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </button>
              <Link to="/chat" className="relative p-2 rounded-full hover:bg-muted transition-colors">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-rose-500 border-2 border-white" />
              </Link>
              <Link to="/settings" className="p-2 rounded-full hover:bg-muted transition-colors">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Link>
              <button
                onClick={onSignOut}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </button>
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
  onSignOut,
}: {
  profile: { full_name: string; avatar_url?: string | null } | null;
  requestCount: number;
  proposalCount: number;
  openRequests: number;
  recentRequests: any[];
  onSignOut: () => void;
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
    { label: "Candidaturas", value: requestCount || 12, icon: FileText, bg: "bg-rose-500" },
    { label: "Oportunidades", value: openRequests || 5, icon: Briefcase, bg: "bg-rose-500" },
    { label: "Avaliacoes", value: "4.9", icon: Star, bg: "bg-navy-500" },
  ];

  const mockCandidaturas = [
    {
      name: "Maria Silva",
      role: "Organic Farm Helper",
      status: "Pendente" as const,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop",
      location: "Brazil",
      rating: 4.9,
      experience: "3 anos exp.",
    },
    {
      name: "John Anderson",
      role: "Recepcionista Hostel",
      status: "Recusado" as const,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop",
      location: "USA",
      rating: 4.7,
      experience: "2 anos exp.",
    },
    {
      name: "Sophie Laurent",
      role: "Social Media Manager",
      status: "Aceita" as const,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop",
      location: "France",
      rating: 5,
      experience: "5 anos exp.",
    },
  ];

  const statusConfig = {
    Pendente: "bg-amber-50 text-amber-600 border border-amber-200",
    Recusado: "bg-tc-red-bg text-tc-red-text border border-tc-red-border",
    Aceita: "bg-tc-green-bg text-tc-green-text border border-tc-green-border",
  } as const;

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-rose-100 text-rose-700 text-lg font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Ola, {firstName}! 👋
                  </h1>
                  <span className="bg-rose-500 text-white px-3 py-0.5 rounded-full text-xs font-medium">
                    Anfitriao
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  <span className="text-sm text-muted-foreground">
                    Fernando de Noronha, PE/BR
                  </span>
                  <span className="text-sm text-muted-foreground">
                    · Membro desde Maio 2025
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500" />
              </button>
              <Link to="/chat" className="relative p-2 rounded-full hover:bg-muted transition-colors">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </Link>
              <Link to="/settings" className="p-2 rounded-full hover:bg-muted transition-colors">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Link>
              <button
                onClick={onSignOut}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                title="Sair"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </button>
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
      <Link to="/bank-integration">
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
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
      </Link>

      {/* ---- Credits card ---- */}
      <Link to="/credits">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center">
                <Zap className="h-5 w-5 text-rose-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold">Host Credits</h4>
                <p className="text-xs text-muted-foreground">
                  Compre creditos para publicar vagas
                </p>
              </div>
              <span className="text-xs text-rose-500 font-medium">
                5 creditos
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* ---- Stats row ---- */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ---- Candidaturas Recentes ---- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-tc-text-primary">Candidaturas Recentes</h3>
          <Link
            to="/proposals"
            className="text-sm text-tc-text-secondary hover:underline flex items-center gap-1"
          >
            Ver todas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {mockCandidaturas.map((c) => (
            <Card key={c.name} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    <img src={c.avatar} alt={c.name} className="h-full w-full object-cover rounded-full" />
                    <AvatarFallback className="bg-rose-50 text-rose-600 text-xs font-medium">
                      {c.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-tc-text-primary">{c.name}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusConfig[c.status]}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-tc-text-secondary">{c.role}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-tc-text-hint">
                      <span className="flex items-center gap-0.5">
                        <span>📍</span> {c.location}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" /> {c.rating}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-3 w-3" /> {c.experience}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-tc-text-hint shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard – role switch                                      */
/* ------------------------------------------------------------------ */
const Dashboard = () => {
  const { profile, organization, userRole, uiRole, signOut } = useAuth();

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
        onSignOut={signOut}
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
      onSignOut={signOut}
    />
  );
};

export default Dashboard;


import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationsModal } from "@/components/modals/NotificationsModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
/*  Profile completion helpers                                         */
/* ------------------------------------------------------------------ */
interface ProfileFields {
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  passport_country?: string | null;
  travel_style?: string | null;
  position?: string | null;
}

const PROFILE_CHECKS: { key: keyof ProfileFields; label: string }[] = [
  { key: "full_name", label: "Nome completo" },
  { key: "avatar_url", label: "Foto de perfil" },
  { key: "bio", label: "Bio" },
  { key: "phone", label: "Telefone" },
  { key: "date_of_birth", label: "Data de nascimento" },
  { key: "nationality", label: "Nacionalidade" },
  { key: "passport_country", label: "País do passaporte" },
  { key: "travel_style", label: "Estilo de viagem" },
];

function computeProfileCompletion(profile: ProfileFields | null) {
  if (!profile) return { percent: 0, missing: PROFILE_CHECKS.map((c) => c.label) };
  const missing: string[] = [];
  let filled = 0;
  for (const check of PROFILE_CHECKS) {
    const val = profile[check.key];
    if (val && String(val).trim().length > 0) {
      filled++;
    } else {
      missing.push(check.label);
    }
  }
  const percent = Math.round((filled / PROFILE_CHECKS.length) * 100);
  return { percent, missing };
}

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
  profileCompletion,
}: {
  profile: ProfileFields | null;
  requestCount: number;
  proposalCount: number;
  openRequests: number;
  onSignOut: () => void;
  recentRequests: any[];
  profileCompletion: { percent: number; missing: string[] };
}) {
  const { t } = useTranslation();
  const [notifOpen, setNotifOpen] = useState(false);
  const firstName = profile?.full_name?.split(" ")[0] ?? t("auth.register.viajante");
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "VI";

  const stats = [
    { label: t("dashboard.traveler.stats.activeApplications"), value: 0, icon: Briefcase },
    { label: t("dashboard.traveler.stats.savedOpportunities"), value: 0, icon: Heart },
    { label: t("dashboard.traveler.stats.avgRating"), value: "--", icon: Star },
    { label: t("dashboard.traveler.stats.experiences"), value: 0, icon: CheckCircle2 },
  ];

  const quickLinks = [
    {
      title: t("dashboard.traveler.quickLinks.academy"),
      icon: GraduationCap,
      iconColor: "#cf3952",
      description: t("dashboard.traveler.quickLinks.academyDesc"),
      meta: t("dashboard.traveler.quickLinks.academyMeta"),
      metaColor: "#cf3952",
      href: "/academy",
    },
    {
      title: t("dashboard.traveler.quickLinks.myCourses"),
      icon: BookOpen,
      iconColor: "#155dfc",
      description: t("dashboard.traveler.quickLinks.myCoursesDesc"),
      meta: t("dashboard.traveler.quickLinks.myCoursesMeta"),
      metaColor: "#155dfc",
      href: "/academy",
    },
    {
      title: t("dashboard.traveler.quickLinks.createCourse"),
      icon: Video,
      iconColor: "#cf3952",
      description: t("dashboard.traveler.quickLinks.createCourseDesc"),
      meta: t("dashboard.traveler.quickLinks.createCourseMeta"),
      metaColor: "#cf3952",
      href: "/academy/create",
    },
    {
      title: t("dashboard.traveler.quickLinks.bankIntegration"),
      icon: DollarSign,
      iconColor: "#2e7d32",
      description: t("dashboard.traveler.quickLinks.bankIntegrationDesc"),
      meta: t("dashboard.traveler.quickLinks.bankIntegrationMeta"),
      metaColor: "#2e7d32",
      href: "/bank-integration",
    },
  ];

  const recentActivity: { text: string; time: string }[] = [];

  return (
    <div className="space-y-4">
      {/* ---- Page title ---- */}
      <div className="flex flex-col gap-1">
        <p className="text-[16px] font-medium text-[#1e2939]">{t("nav.home")}</p>
        <p className="text-[14px] text-[#4a5565]">{t("dashboard.subtitle")}</p>
      </div>

      {/* ---- Header card ---- */}
      <div className="bg-white border border-[#dbdbdb] rounded-[10px] p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          {/* Avatar + name */}
          <div className="flex items-center gap-[10px]">
            <div className="relative shrink-0 h-[50px] w-[50px]">
              <Avatar className="h-[50px] w-[50px]">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-[rgba(54,71,99,0.1)] text-[#364763] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-[#2b7fff] border-2 border-white flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-medium text-[#1e2939]">
                  {t("dashboard.greeting", { name: firstName })} 👋
                </span>
                <span
                  className="text-[12px] text-white rounded-[10px] px-2 py-[2px]"
                  style={{ background: "linear-gradient(to right, #364763, #cf3952)" }}
                >
                  {t("auth.register.viajante")}
                </span>
              </div>
              <div className="flex items-center gap-[10px] text-[14px] text-[#4a5565]">
                <span>{t("dashboard.location")}</span>
                <span>•</span>
                <span>{t("dashboard.memberSince")}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-[10px]">
            <Link to="/credits">
              <div
                className="flex items-center gap-2 px-4 py-1 rounded-[10px] cursor-pointer"
                style={{ background: "linear-gradient(to right, #f57f17, #fdd835)" }}
              >
                <Zap className="h-4 w-4 text-white" />
                <span className="text-[12px] font-medium text-white">5 {t("common.credits")}</span>
              </div>
            </Link>
            <button
              onClick={() => setNotifOpen(true)}
              className="relative h-11 w-11 flex items-center justify-center rounded-[14px] hover:bg-muted transition-colors"
            >
              <Bell className="h-5 w-5 text-[#1e2939]" />
              <span className="absolute top-2 left-[26px] h-2 w-2 rounded-full bg-[#fb2c36]" />
            </button>
            <Link to="/chat" className="relative h-11 w-11 flex items-center justify-center rounded-[14px] hover:bg-muted transition-colors">
              <MessageSquare className="h-5 w-5 text-[#1e2939]" />
              <span className="absolute top-2 left-[26px] h-2 w-2 rounded-full bg-[#fb2c36]" />
            </Link>
            <Link to="/settings" className="h-11 w-11 flex items-center justify-center rounded-[14px] hover:bg-muted transition-colors">
              <Settings className="h-5 w-5 text-[#1e2939]" />
            </Link>
            <button
              onClick={onSignOut}
              className="h-11 w-11 flex items-center justify-center rounded-[14px] hover:bg-muted transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5 text-[#1e2939]" />
            </button>
          </div>
        </div>

        {/* Profile completion */}
        <Link to="/settings">
          <div className="bg-[#f3f3f3] rounded-[10px] p-4 flex flex-col gap-2 cursor-pointer">
            <div className="flex items-center justify-between text-[14px] font-medium">
              <span className="text-[#364153]">{t("dashboard.completeProfile")}</span>
              <span className="text-[#cf3952]">{profileCompletion.percent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#dbdbdb] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#cf3952] transition-all duration-300"
                style={{ width: `${profileCompletion.percent}%` }}
              />
            </div>
            <p className="text-[12px] text-[#4a5565]">
              {profileCompletion.percent < 100
                ? t("dashboard.completeProfileHint")
                : t("dashboard.profileComplete")}
            </p>
          </div>
        </Link>
      </div>

      {/* ---- Stats row ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-[#dbdbdb] rounded-[10px] p-4 flex items-center gap-4">
            <div className="flex-1 flex flex-col gap-[10px] min-w-0">
              <p className="text-[14px] text-[#3f444c]">{s.label}</p>
              <p className="text-[28px] font-medium text-[#12100f] leading-none">{s.value}</p>
            </div>
            <div className="bg-[#364763] rounded-[10px] h-10 w-10 flex items-center justify-center shrink-0">
              <s.icon className="h-5 w-5 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* ---- Feature cards ---- */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/opportunities">
          <div className="bg-[rgba(54,71,99,0.1)] rounded-[10px] p-4 flex flex-col gap-[10px] cursor-pointer">
            <Search className="h-[30px] w-[30px] text-[#364763]" />
            <p className="text-[16px] font-medium text-[#364763]">{t("dashboard.traveler.discoverOpportunities")}</p>
            <p className="text-[16px] text-[#364763]">{t("dashboard.traveler.discoverOpportunitiesDesc")}</p>
            <div className="flex items-center gap-2 opacity-80">
              <span className="text-[14px] text-[#364763]">{t("dashboard.traveler.newToday")}</span>
              <span className="text-[12px] font-medium text-[#364763]">•</span>
              <span className="text-[14px] text-[#364763]">{t("dashboard.traveler.matchAvailable")}</span>
            </div>
          </div>
        </Link>

        <Link to="/community">
          <div className="bg-[rgba(207,57,82,0.1)] rounded-[10px] p-4 flex flex-col gap-[10px] cursor-pointer">
            <Users className="h-[30px] w-[30px] text-[#cf3952]" />
            <p className="text-[16px] font-medium text-[#cf3952]">{t("dashboard.traveler.discoverCommunity")}</p>
            <p className="text-[16px] text-[#cf3952]">{t("dashboard.traveler.discoverCommunityDesc")}</p>
            <div className="flex items-center gap-2 opacity-80">
              <span className="text-[14px] text-[#cf3952]">{t("dashboard.traveler.activeTravelers")}</span>
              <span className="text-[12px] font-medium text-[#364763]">•</span>
              <span className="text-[14px] text-[#cf3952]">{t("dashboard.traveler.onlineNow")}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* ---- Quick-link cards ---- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((ql) => (
          <Link key={ql.title} to={ql.href}>
            <div className="bg-white border border-[#dbdbdb] rounded-[10px] p-4 flex flex-col gap-[10px] cursor-pointer hover:shadow-md transition-shadow">
              <ql.icon className="h-[30px] w-[30px]" style={{ color: ql.iconColor }} />
              <p className="text-[16px] font-medium text-[#1e2939]">{ql.title}</p>
              <p className="text-[14px] text-[#4a5565]">{ql.description}</p>
              <p className="text-[14px]" style={{ color: ql.metaColor }}>{ql.meta}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ---- Candidaturas Recentes + Atividade Recente ---- */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Candidaturas Recentes */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-medium text-[#1e2939]">{t("dashboard.traveler.recentApplications")}</p>
            <Link
              to="/proposals"
              className="flex items-center gap-1 text-[14px] font-medium text-[#155dfc] hover:underline"
            >
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="bg-white border border-[#dbdbdb] rounded-[10px] p-4">
            {recentRequests.length === 0 ? (
              <p className="text-sm text-[#4a5565]">{t("dashboard.traveler.noRecentApplications")}</p>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((req: any) => (
                  <div key={req.id} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[rgba(54,71,99,0.1)] flex items-center justify-center text-[#364763] font-medium text-xs shrink-0">
                      {req.title?.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{req.title}</p>
                      <p className="text-xs text-[#4a5565]">{req.destination} · {req.status}</p>
                    </div>
                    <span className="text-xs text-[#4a5565] whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Atividade Recente */}
        <div className="flex flex-col gap-4">
          <p className="text-[16px] font-medium text-[#1e2939]">{t("dashboard.traveler.recentActivity")}</p>
          <div className="bg-white border border-[#dbdbdb] rounded-[10px] p-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-[#4a5565]">{t("dashboard.traveler.noRecentActivity")}</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-[#364763] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{a.text}</p>
                      <p className="text-xs text-[#4a5565]">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <NotificationsModal open={notifOpen} onClose={() => setNotifOpen(false)} />
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
  const { t } = useTranslation();
  const [notifOpen, setNotifOpen] = useState(false);
  const firstName = profile?.full_name?.split(" ")[0] ?? t("auth.register.anfitriao");
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AN";

  const stats = [
    { label: t("dashboard.host.stats.applications"), value: requestCount, icon: FileText, bg: "bg-rose-500" },
    { label: t("dashboard.host.stats.opportunities"), value: openRequests, icon: Briefcase, bg: "bg-rose-500" },
    { label: t("dashboard.host.stats.reviews"), value: "--", icon: Star, bg: "bg-navy-500" },
  ];


  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-rose-100 text-rose-700 text-lg font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {t("dashboard.greeting", { name: firstName })} 👋
                  </h1>
                  <span className="bg-rose-500 text-white px-3 py-0.5 rounded-full text-xs font-medium">
                    {t("auth.register.anfitriao")}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  <span className="text-sm text-muted-foreground">
                    {t("auth.register.anfitriao")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setNotifOpen(true)}
                className="relative p-2 rounded-full hover:bg-muted transition-colors"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />
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
                    {t("dashboard.host.createOpportunity")}
                  </h3>
                  <p className="text-sm text-white/80">
                    {t("dashboard.host.createOpportunityDesc")}
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
              <h4 className="text-sm font-semibold">{t("dashboard.host.bankIntegration")}</h4>
              <p className="text-xs text-muted-foreground">
                {t("dashboard.host.bankIntegrationDesc")}
              </p>
            </div>
            <span className="text-xs text-emerald-600 font-medium">
              {t("common.configure")}
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
                <h4 className="text-sm font-semibold">{t("dashboard.host.hostCredits")}</h4>
                <p className="text-xs text-muted-foreground">
                  {t("dashboard.host.hostCreditsDesc")}
                </p>
              </div>
              <span className="text-xs text-rose-500 font-medium">
                5 {t("common.credits")}
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
          <h3 className="font-semibold text-tc-text-primary">{t("dashboard.host.recentApplications")}</h3>
          <Link
            to="/anfitriao/candidaturas"
            className="text-sm text-tc-text-secondary hover:underline flex items-center gap-1"
          >
            Ver todas <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              {t("dashboard.host.noApplications")}
            </p>
          </CardContent>
        </Card>
      </div>
      <NotificationsModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard – role switch                                      */
/* ------------------------------------------------------------------ */
const Dashboard = () => {
  const { profile, organization, userRole, uiRole, signOut, user } = useAuth();

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

  // Viajante: fetch traveler's own proposals (candidaturas)
  // Anfitriao: fetch host's own requests (oportunidades)
  const { data: recentRequests = [] } = useQuery({
    queryKey: ["dashboard-recent", user?.id, uiRole],
    queryFn: async () => {
      if (!user) return [];

      if (uiRole === "anfitriao") {
        // Host: show their own requests
        const { data } = await supabase
          .from("requests")
          .select("id, title, destination, status, created_at")
          .eq("created_by", user.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: false })
          .limit(5);
        return data ?? [];
      }

      // Traveler: show nothing (no proposals integration yet)
      return [];
    },
    enabled: !!user,
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
  const profileCompletion = computeProfileCompletion(profile);

  return (
    <ViajanteDashboard
      profile={profile}
      requestCount={requestCount}
      proposalCount={proposalCount}
      openRequests={openRequests}
      recentRequests={recentRequests}
      onSignOut={signOut}
      profileCompletion={profileCompletion}
    />
  );
};

export default Dashboard;

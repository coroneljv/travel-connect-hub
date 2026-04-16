import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dbRoleToUIRole } from "@/lib/roles";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import {
  Search,
  Play,
  Info,
  BookOpen,
  Users,
  DollarSign,
  Star,
  Eye,
  Edit3,
  Trash2,
  Award,
  Clock,
  ChevronRight,
  Grid3X3,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

/* ================================================================== */
/*  Types                                                               */
/* ================================================================== */

interface CourseRow {
  id: string;
  title: string;
  subtitle: string | null;
  cover_image_url: string | null;
  level: string | null;
  language: string | null;
  category: string | null;
  instructor_name: string | null;
  pricing_type: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface CourseCardData {
  id: string;
  title: string;
  image: string;
  author: string;
  level: string;
  modules: number;
  lessons: number;
  hours: number;
  rating: number;
  students: number;
  tags: string[];
  progress: number;
}

type TabKey = "descobrir" | "meus-cursos" | "meu-aprendizado";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop";

function mapCourseRow(
  row: CourseRow,
  modulesCount: number,
  lessonsCount: number
): CourseCardData {
  const tags: string[] = [];
  if (row.category) tags.push(row.category);
  if (row.level) tags.push(row.level);
  if (row.pricing_type === "free") tags.push("Gratuito");

  return {
    id: row.id,
    title: row.title,
    image: row.cover_image_url || PLACEHOLDER_IMAGE,
    author: row.instructor_name || "Instrutor",
    level: row.level || "Iniciante",
    modules: modulesCount,
    lessons: lessonsCount,
    hours: Math.max(1, Math.round(lessonsCount * 0.35)),
    rating: 0,
    students: 0,
    tags,
    progress: 0,
  };
}

/* ================================================================== */
/*  Shared UI Components                                                */
/* ================================================================== */

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-xs text-tc-text-hint ml-1">{rating}</span>
    </div>
  );
}

function TagBadge({ label }: { label: string }) {
  return (
    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-rose-500 text-white">
      {label}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BookOpen className="h-12 w-12 text-tc-text-hint mb-4" />
      <p className="text-tc-text-secondary text-sm">{message}</p>
    </div>
  );
}

function CourseCard({
  course,
  showProgress,
}: {
  course: CourseCardData;
  showProgress?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Link to={`/academy/courses/${course.id}`} className="block group">
      <Card className="overflow-hidden border border-border hover:shadow-lg transition-shadow">
        <div className="relative aspect-video">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {course.tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
          <h3 className="font-medium text-tc-text-primary leading-snug line-clamp-2 group-hover:text-rose-500 transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-tc-text-hint">{course.author}</p>
          <div className="flex items-center gap-2 text-xs text-tc-text-secondary">
            <span>{t("academy.modules", { count: course.modules })}</span>
            <span className="text-tc-text-hint">-</span>
            <span>{course.hours}h</span>
            <span className="text-tc-text-hint">-</span>
            <span>{course.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <RatingStars rating={course.rating} />
            <span className="text-xs text-tc-text-hint flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course.students.toLocaleString()}
            </span>
          </div>
          {showProgress && course.progress > 0 && (
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-xs text-tc-text-hint">
                <span>{t("academy.progress")}</span>
                <span>{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-1.5" />
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

/* ================================================================== */
/*  Hook: fetch all courses with counts                                 */
/* ================================================================== */

function useAllCourses() {
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      const { data: rows, error } = await supabase
        .from("courses")
        .select("*")
        .is("deleted_at", null)
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error || !rows || rows.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      const courseIds = rows.map((r: CourseRow) => r.id);

      const { data: modulesData } = await supabase
        .from("course_modules")
        .select("id, course_id")
        .in("course_id", courseIds);

      const moduleIds = (modulesData || []).map((m: { id: string }) => m.id);
      let lessonsData: { id: string; module_id: string }[] = [];
      if (moduleIds.length > 0) {
        const { data } = await supabase
          .from("course_lessons")
          .select("id, module_id")
          .in("module_id", moduleIds);
        lessonsData = data || [];
      }

      const modulesPerCourse: Record<string, number> = {};
      const lessonsPerCourse: Record<string, number> = {};
      const moduleIdToCourseId: Record<string, string> = {};

      for (const m of modulesData || []) {
        modulesPerCourse[m.course_id] = (modulesPerCourse[m.course_id] || 0) + 1;
        moduleIdToCourseId[m.id] = m.course_id;
      }
      for (const l of lessonsData) {
        const cid = moduleIdToCourseId[l.module_id];
        if (cid) lessonsPerCourse[cid] = (lessonsPerCourse[cid] || 0) + 1;
      }

      const mapped = rows.map((row: CourseRow) =>
        mapCourseRow(
          row,
          modulesPerCourse[row.id] || 0,
          lessonsPerCourse[row.id] || 0
        )
      );

      setCourses(mapped);
      setLoading(false);
    }
    fetchCourses();
  }, []);

  return { courses, loading };
}

/* ================================================================== */
/*  TAB: Descobrir                                                     */
/* ================================================================== */
function TabDescobrir({
  uiRole,
}: {
  uiRole: "viajante" | "anfitriao" | null;
}) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const { courses, loading } = useAllCourses();

  const heroTitle =
    uiRole === "viajante"
      ? t("academy.hero.travelerTitle")
      : t("academy.hero.hostTitle");

  const heroDescription =
    uiRole === "viajante"
      ? t("academy.hero.travelerDesc")
      : t("academy.hero.hostDesc");

  const heroCourse = courses.length > 0 ? courses[0] : null;

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative w-full h-[300px] rounded-xl overflow-hidden">
        <img
          src={heroCourse?.image || PLACEHOLDER_IMAGE}
          alt={heroTitle}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-800/95 via-navy-700/80 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center h-full px-8 max-w-2xl">
          <div className="flex flex-wrap gap-2 mb-3">
            {heroCourse ? (
              heroCourse.tags.map((tag) => <TagBadge key={tag} label={tag} />)
            ) : (
              <>
                <TagBadge label="Academy" />
                <TagBadge label="Cursos" />
              </>
            )}
          </div>
          {heroCourse && (
            <p className="text-white/70 text-sm mb-1">
              {t("academy.modules", { count: heroCourse.modules })} - {heroCourse.hours}h
            </p>
          )}
          <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
            {heroCourse ? heroCourse.title : heroTitle}
          </h1>
          <p className="text-white/80 text-sm mb-4 line-clamp-3">
            {heroDescription}
          </p>
          {heroCourse && (
            <div className="flex items-center gap-3 mb-4">
              <Link
                to={`/academy/courses/${heroCourse.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy-500 text-white font-medium text-sm hover:bg-navy-600 transition-colors"
              >
                <Play className="h-4 w-4" />
                {t("academy.startCourse")}
              </Link>
              <Link
                to={`/academy/courses/${heroCourse.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-500/80 text-white font-medium text-sm hover:bg-rose-500 transition-colors"
              >
                <Info className="h-4 w-4" />
                {t("academy.moreInfo")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <input
            type="text"
            placeholder={t("academy.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm text-tc-text-primary placeholder:text-tc-text-placeholder focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
          />
        </div>
        <button className="px-5 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-2">
          <Search className="h-4 w-4" />
          {t("common.search")}
        </button>
        {uiRole === "viajante" && (
          <Link
            to="/academy"
            onClick={(e) => {
              e.preventDefault();
            }}
            className="px-5 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            {t("academy.tabs.myCourses")}
          </Link>
        )}
      </div>

      {/* Course section */}
      {courses.length === 0 ? (
        <EmptyState message={t("academy.noCourses")} />
      ) : uiRole === "anfitriao" ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-rose-500" />
              {t("academy.categories")}
            </h2>
            <Link
              to="/academy"
              className="text-sm text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
            >
              {t("common.viewAll")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
              <Play className="h-5 w-5 text-rose-500" />
              {t("academy.availableCourses")}
            </h2>
            <Link
              to="/academy"
              className="text-sm text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
            >
              {t("common.viewAllM")}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  TAB: Meus Cursos (Anfitriao)                                       */
/* ================================================================== */
function MeusCursosAnfitriao() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyCourses() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("created_by", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCourses(data);
      }
      setLoading(false);
    }
    fetchMyCourses();
  }, [user]);

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-navy-700 to-navy-500 p-8">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold text-white mb-2">
            {t("academy.host.shareKnowledge")}
          </h2>
          <p className="text-white/80 text-sm mb-4">
            {t("academy.host.shareKnowledgeDesc")}
          </p>
          <Link
            to="/academy/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-500 text-white font-medium text-sm hover:bg-rose-600 transition-colors"
          >
            {t("academy.host.createCourse")}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-navy-50 flex items-center justify-center">
              <Users className="h-6 w-6 text-navy-500" />
            </div>
            <div>
              <p className="text-sm text-tc-text-hint">{t("academy.host.totalStudents")}</p>
              <p className="text-2xl font-bold text-tc-text-primary">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-rose-50 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <p className="text-sm text-tc-text-hint">{t("academy.host.publishedCourses")}</p>
              <p className="text-2xl font-bold text-tc-text-primary">
                {courses.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-tc-text-hint">{t("academy.host.totalRevenue")}</p>
              <p className="text-2xl font-bold text-tc-text-primary">
                R$ 0,00
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-yellow-50 flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-tc-text-hint">{t("academy.host.avgRating")}</p>
              <p className="text-2xl font-bold text-tc-text-primary">--</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course list */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-tc-text-primary">
          {t("academy.host.yourCourses")}
        </h3>
        {courses.length === 0 ? (
          <EmptyState message={t("academy.host.noCoursesYet")} />
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-64 md:h-auto h-40 shrink-0">
                  <img
                    src={course.cover_image_url || PLACEHOLDER_IMAGE}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-lg font-medium text-tc-text-primary mb-1">
                      {course.title}
                    </h4>
                    <p className="text-sm text-tc-text-hint mb-2">
                      {course.subtitle || t("academy.noDescription")}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-tc-text-secondary mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-tc-text-hint" />
                        Alunos: 0
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-tc-text-hint" />
                        Receita: R$ 0,00
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-tc-text-hint" />
                        Taxa de conclusão: 0%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/academy/courses/${course.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-500 text-white text-sm font-medium hover:bg-navy-600 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      {t("academy.host.viewDetails")}
                    </Link>
                    <Link
                      to={`/academy/courses/${course.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-tc-text-secondary text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                      {t("common.edit")}
                    </Link>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
                      <Trash2 className="h-4 w-4" />
                      {t("common.delete")}
                    </button>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB: Meus Cursos (Viajante)                                        */
/* ================================================================== */
function MeusCursosViajante() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
            <Play className="h-5 w-5 text-rose-500" />
            {t("academy.continueWatching")}
          </h2>
        </div>
        <EmptyState message={t("academy.notEnrolled")} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-rose-500" />
            {t("academy.enrolledCourses")}
          </h2>
        </div>
        <EmptyState message={t("academy.notEnrolled")} />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB: Meu Aprendizado                                               */
/* ================================================================== */
function TabMeuAprendizado() {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
            <Play className="h-5 w-5 text-rose-500" />
            {t("academy.continueWatching")}
          </h2>
        </div>
        <EmptyState message={t("academy.notEnrolled")} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            {t("academy.completed")}
          </h2>
        </div>
        <EmptyState message={t("academy.noCompleted")} />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Academy Page                                                  */
/* ================================================================== */
export default function Academy() {
  const { t } = useTranslation();
  const { userRole } = useAuth();
  const uiRole = userRole ? dbRoleToUIRole(userRole) : null;
  const [activeTab, setActiveTab] = useState<TabKey>("descobrir");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "descobrir", label: t("academy.tabs.discover") },
    { key: "meus-cursos", label: t("academy.tabs.myCourses") },
    { key: "meu-aprendizado", label: t("academy.tabs.myLearning") },
  ];

  return (
    <div className="min-h-screen bg-warm-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-tc-text-primary flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-rose-500" />
            {t("academy.title")}
          </h1>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 mb-8 bg-white rounded-lg p-1 border border-border w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-rose-500 text-white"
                  : "text-tc-text-secondary bg-white hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "descobrir" && <TabDescobrir uiRole={uiRole} />}
        {activeTab === "meus-cursos" &&
          (uiRole === "anfitriao" ? (
            <MeusCursosAnfitriao />
          ) : (
            <MeusCursosViajante />
          ))}
        {activeTab === "meu-aprendizado" && <TabMeuAprendizado />}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Play,
  Share2,
  Star,
  Users,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Award,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseData {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  level: string | null;
  language: string | null;
  pricing_type: string | null;
  instructor_name: string | null;
  updated_at: string | null;
}

interface ModuleData {
  id: string;
  title: string;
  sort_order: number;
  lessons: LessonData[];
}

interface LessonData {
  id: string;
  title: string;
  type: string | null;
  duration_minutes: number | null;
  sort_order: number;
}

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      if (!id) return;
      setLoading(true);

      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (courseError || !courseData) {
        setCourse(null);
        setLoading(false);
        return;
      }
      setCourse(courseData);

      // Fetch modules
      const { data: modulesData } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_id", id)
        .order("sort_order", { ascending: true });

      const modulesList = modulesData || [];

      // Fetch lessons for all modules
      const moduleIds = modulesList.map((m: { id: string }) => m.id);
      let lessonsData: LessonData[] = [];
      if (moduleIds.length > 0) {
        const { data } = await supabase
          .from("course_lessons")
          .select("*")
          .in("module_id", moduleIds)
          .order("sort_order", { ascending: true });
        lessonsData = (data || []) as LessonData[];
      }

      // Group lessons by module
      const lessonsByModule: Record<string, LessonData[]> = {};
      for (const lesson of lessonsData) {
        const mid = (lesson as any).module_id as string;
        if (!lessonsByModule[mid]) lessonsByModule[mid] = [];
        lessonsByModule[mid].push(lesson);
      }

      const builtModules: ModuleData[] = modulesList.map((m: any) => ({
        id: m.id,
        title: m.title,
        sort_order: m.sort_order,
        lessons: lessonsByModule[m.id] || [],
      }));

      setModules(builtModules);

      // Expand the first module by default
      if (builtModules.length > 0) {
        setExpandedModules([builtModules[0].id]);
      }

      setLoading(false);
    }
    fetchCourse();
  }, [id]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((m) => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalMinutes = modules.reduce(
    (sum, m) =>
      sum + m.lessons.reduce((s, l) => s + (l.duration_minutes || 0), 0),
    0
  );
  const totalHours = Math.max(1, Math.round(totalMinutes / 60));

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "--:--";
    const m = minutes % 60;
    const h = Math.floor(minutes / 60);
    if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}min`;
    return `${m}:00`;
  };

  const formatModuleDuration = (lessons: LessonData[]) => {
    const total = lessons.reduce((s, l) => s + (l.duration_minutes || 0), 0);
    if (total === 0) return "--";
    const h = Math.floor(total / 60);
    const m = total % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}min`;
    return `${m} min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <BookOpen className="h-12 w-12 text-tc-text-hint mb-4" />
        <p className="text-tc-text-secondary text-lg font-medium mb-2">
          Curso não encontrado
        </p>
        <Link
          to="/academy"
          className="text-rose-500 hover:text-rose-600 text-sm font-medium"
        >
          Voltar aos cursos
        </Link>
      </div>
    );
  }

  const lastUpdateFormatted = course.updated_at
    ? new Date(course.updated_at).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      })
    : "--";

  return (
    <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
      {/* Hero Section */}
      <div className="relative w-full" style={{ minHeight: "220px" }}>
        <img
          src={
            course.cover_image_url ||
            "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop"
          }
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-navy-500/80" />
        <div
          className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between h-full"
          style={{ minHeight: "220px" }}
        >
          <div>
            <Link
              to="/academy"
              className="inline-flex items-center gap-2 text-white text-sm hover:underline transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos Cursos
            </Link>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {course.level && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white">
                  {course.level}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {course.title}
            </h1>
            {course.subtitle && (
              <p className="text-white/80 text-sm sm:text-base max-w-2xl">
                {course.subtitle}
              </p>
            )}

            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {totalHours} horas
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {totalLessons} aulas
              </span>
              {course.instructor_name && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {course.instructor_name}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left Column - Course Content */}
          <div>
            <h2 className="text-lg font-semibold text-tc-text-primary mb-4">
              Conteúdo do Curso
            </h2>

            {modules.length === 0 ? (
              <p className="text-sm text-tc-text-hint py-8 text-center">
                Este curso ainda não possui módulos
              </p>
            ) : (
              <div className="space-y-3">
                {modules.map((module, moduleIndex) => {
                  const isExpanded = expandedModules.includes(module.id);

                  return (
                    <div
                      key={module.id}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      {/* Module Header */}
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-semibold">
                          {moduleIndex + 1}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-tc-text-primary">
                            {module.title}
                          </p>
                          <p className="text-xs text-tc-text-hint">
                            {module.lessons.length} aulas &bull;{" "}
                            {formatModuleDuration(module.lessons)}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-tc-text-hint flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-tc-text-hint flex-shrink-0" />
                        )}
                      </button>

                      {/* Expanded Lessons */}
                      {isExpanded && module.lessons.length > 0 && (
                        <div className="border-t border-border bg-gray-50/50">
                          {module.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              to={`/academy/courses/${id}/watch?lesson=${lesson.id}`}
                              className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <div className="flex-shrink-0">
                                {lesson.type === "quiz" ? (
                                  <span className="flex items-center justify-center w-5 h-5 text-sm">
                                    🎯
                                  </span>
                                ) : (
                                  <Play className="h-5 w-5 text-tc-text-hint" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-tc-text-primary">
                                  {lesson.title}
                                </p>
                              </div>
                              <span className="text-xs text-tc-text-hint flex-shrink-0">
                                {lesson.duration_minutes
                                  ? `${lesson.duration_minutes} min`
                                  : "--"}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-4">
            <Link to={`/academy/courses/${id}/watch`}>
              <Button className="w-full bg-navy-500 hover:bg-navy-600 text-white gap-2">
                <Play className="h-4 w-4" />
                Comecar Agora
              </Button>
            </Link>

            <Button variant="outline" className="w-full gap-2">
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>

            {/* Course Info Card */}
            <div className="border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-tc-text-hint">Nível</span>
                <span className="text-sm font-medium text-tc-text-primary">
                  {course.level || "Não especificado"}
                </span>
              </div>
              <div className="border-t border-border" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-tc-text-hint">Idioma</span>
                <span className="text-sm font-medium text-tc-text-primary">
                  {course.language || "Português"}
                </span>
              </div>
              <div className="border-t border-border" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-tc-text-hint">
                  Última atualização
                </span>
                <span className="text-sm font-medium text-tc-text-primary">
                  {lastUpdateFormatted}
                </span>
              </div>
              <div className="border-t border-border" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-tc-text-hint">Certificado</span>
                <span className="text-sm font-medium text-tc-text-primary inline-flex items-center gap-1">
                  <Award className="h-4 w-4 text-amber-500" />
                  Incluso
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {course.description && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-tc-text-primary mb-3">
              Sobre o Curso
            </h2>
            <p className="text-sm text-tc-text-secondary leading-relaxed">
              {course.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

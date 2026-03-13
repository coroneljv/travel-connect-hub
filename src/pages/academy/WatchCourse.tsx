import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize,
  CheckCircle2,
  Download,
  Clock,
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BookOpen,
  X,
  Trophy,
} from "lucide-react";

interface CourseInfo {
  id: string;
  title: string;
  support_material_urls: string[] | null;
}

interface ModuleInfo {
  id: string;
  title: string;
  sort_order: number;
}

interface LessonInfo {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  type: string | null;
  video_url: string | null;
  material_url: string | null;
  duration_minutes: number | null;
  sort_order: number;
}

interface FlatLesson {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  description: string | null;
  type: string | null;
  video_url: string | null;
  material_url: string | null;
  duration_minutes: number | null;
  status: "upcoming" | "current";
}

export default function WatchCourse() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"content" | "resources">(
    "content"
  );
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [flatLessons, setFlatLessons] = useState<FlatLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`tc_completed_${id}`);
      if (saved) return new Set(JSON.parse(saved));
    } catch { /* ignore */ }
    return new Set();
  });
  const [showCertificate, setShowCertificate] = useState(false);

  // Persist completed lessons to localStorage
  const persistCompleted = (next: Set<string>) => {
    setCompletedLessons(next);
    localStorage.setItem(`tc_completed_${id}`, JSON.stringify([...next]));
  };

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);

      // Fetch course
      const { data: courseData } = await supabase
        .from("courses")
        .select("id, title, support_material_urls")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (!courseData) {
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

      const modulesList: ModuleInfo[] = (modulesData || []) as ModuleInfo[];

      // Fetch lessons
      const moduleIds = modulesList.map((m) => m.id);
      let lessonsData: LessonInfo[] = [];
      if (moduleIds.length > 0) {
        const { data } = await supabase
          .from("course_lessons")
          .select("*")
          .in("module_id", moduleIds)
          .order("sort_order", { ascending: true });
        lessonsData = (data || []) as LessonInfo[];
      }

      // Build flat list of lessons ordered by module then lesson sort_order
      const lessonsByModule: Record<string, LessonInfo[]> = {};
      for (const l of lessonsData) {
        if (!lessonsByModule[l.module_id]) lessonsByModule[l.module_id] = [];
        lessonsByModule[l.module_id].push(l);
      }

      const flat: FlatLesson[] = [];
      for (const mod of modulesList) {
        const modLessons = lessonsByModule[mod.id] || [];
        for (const lesson of modLessons) {
          flat.push({
            id: lesson.id,
            moduleId: mod.id,
            moduleTitle: mod.title,
            title: lesson.title,
            description: lesson.description,
            type: lesson.type,
            video_url: lesson.video_url,
            material_url: lesson.material_url,
            duration_minutes: lesson.duration_minutes,
            status: flat.length === 0 ? "current" : "upcoming",
          });
        }
      }

      setFlatLessons(flat);

      // Jump to requested lesson from query param
      const requestedLesson = searchParams.get("lesson");
      if (requestedLesson && flat.length > 0) {
        const idx = flat.findIndex((l) => l.id === requestedLesson);
        if (idx >= 0) setCurrentLessonIndex(idx);
      }

      // Check if course was already completed (from localStorage)
      try {
        const saved = localStorage.getItem(`tc_completed_${id}`);
        if (saved) {
          const savedIds = new Set(JSON.parse(saved) as string[]);
          if (flat.length > 0 && flat.every((l) => savedIds.has(l.id))) {
            setShowCertificate(true);
          }
        }
      } catch { /* ignore */ }

      setLoading(false);
    }
    fetchData();
  }, [id]);

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

  const currentLesson = flatLessons[currentLessonIndex] || null;
  const totalLessons = flatLessons.length;
  const completedCount = completedLessons.size;
  const progressPercent =
    totalLessons > 0
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;
  const allCompleted = totalLessons > 0 && completedCount === totalLessons;

  const handleCompleteLesson = () => {
    if (!currentLesson) return;
    const next = new Set(completedLessons);
    next.add(currentLesson.id);
    persistCompleted(next);

    // If all lessons are now completed, show certificate
    if (next.size === totalLessons) {
      setShowCertificate(true);
      return;
    }

    // Advance to the next incomplete lesson
    if (currentLessonIndex < flatLessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  // Build resources list
  const resources: { name: string; url: string }[] = [];
  if (course.support_material_urls) {
    course.support_material_urls.forEach((url, i) => {
      const filename = url.split("/").pop() || `Material ${i + 1}`;
      resources.push({ name: filename, url });
    });
  }
  if (currentLesson?.material_url) {
    const filename =
      currentLesson.material_url.split("/").pop() || "Material da aula";
    resources.push({ name: filename, url: currentLesson.material_url });
  }

  return (
    <div className="min-h-screen bg-warm-gray">
      {/* ---- Top bar ---- */}
      <div className="bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: back link */}
          <Link
            to={`/academy/courses/${id}`}
            className="flex items-center gap-1.5 text-sm text-tc-text-secondary hover:text-tc-text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Curso</span>
          </Link>

          {/* Center: course title + lesson info */}
          <div className="hidden md:flex flex-col items-center">
            <span className="text-sm font-bold text-tc-text-primary">
              {course.title}
            </span>
            <span className="text-sm text-tc-text-hint">
              Aula {currentLessonIndex + 1} de {totalLessons}
              {currentLesson
                ? ` \u2022 ${currentLesson.moduleTitle}`
                : ""}
            </span>
          </div>

          {/* Right: progress badge */}
          <span className="bg-rose-500 text-white text-xs font-medium rounded-lg px-3 py-1">
            {progressPercent}% Completo
          </span>
        </div>
      </div>

      {/* ---- Main area ---- */}
      <div className="max-w-[1440px] mx-auto px-4 py-6">
        {flatLessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-12 w-12 text-tc-text-hint mb-4" />
            <p className="text-tc-text-secondary text-sm">
              Este curso ainda não possui aulas
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ========== Left column - Video + Info ========== */}
            <div className="flex-1 lg:w-[65%] space-y-4">
              {/* Video player */}
              <div className="relative">
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  {currentLesson?.video_url ? (
                    <video
                      key={currentLesson.video_url}
                      src={currentLesson.video_url}
                      controls
                      className="w-full h-full"
                    />
                  ) : (
                    <>
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <Play className="h-16 w-16 text-white/40 mx-auto mb-2" />
                          <p className="text-white/50 text-sm">
                            Vídeo não disponível para esta aula
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 bg-gray-700 rounded-b-lg overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-b-lg"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Video controls bar */}
              <div className="bg-white rounded-lg border border-border px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                    onClick={() =>
                      setCurrentLessonIndex((i) => Math.max(0, i - 1))
                    }
                  >
                    <SkipBack className="h-4 w-4 text-tc-text-secondary" />
                  </button>
                  <button className="p-1.5 rounded-full bg-navy-500 hover:bg-navy-600 transition-colors">
                    <Play className="h-4 w-4 text-white fill-white" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 transition-colors"
                    onClick={() =>
                      setCurrentLessonIndex((i) =>
                        Math.min(flatLessons.length - 1, i + 1)
                      )
                    }
                  >
                    <SkipForward className="h-4 w-4 text-tc-text-secondary" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                    <Volume2 className="h-4 w-4 text-tc-text-secondary" />
                  </button>
                  <span className="text-xs text-tc-text-hint font-medium ml-1">
                    {currentLesson?.duration_minutes
                      ? `${currentLesson.duration_minutes} min`
                      : "--:--"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-tc-text-secondary bg-gray-100 rounded px-2 py-0.5">
                    1.0x
                  </span>
                  <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                    <Maximize className="h-4 w-4 text-tc-text-secondary" />
                  </button>
                </div>
              </div>

              {/* Lesson title + description */}
              <div className="bg-white rounded-lg border border-border p-5 space-y-4">
                <h2 className="text-lg font-medium text-tc-text-primary">
                  {currentLesson?.title || "Aula"}
                </h2>
                {currentLesson?.description && (
                  <p className="text-sm text-tc-text-secondary leading-relaxed">
                    {currentLesson.description}
                  </p>
                )}

                {/* Complete button */}
                <button
                  onClick={handleCompleteLesson}
                  disabled={currentLesson ? completedLessons.has(currentLesson.id) : false}
                  className={`w-full font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    currentLesson && completedLessons.has(currentLesson.id)
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {currentLesson && completedLessons.has(currentLesson.id)
                    ? "Aula Concluida"
                    : "Concluir e Continuar"}
                </button>

                {/* Bottom navigation */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() =>
                      setCurrentLessonIndex((i) => Math.max(0, i - 1))
                    }
                    disabled={currentLessonIndex === 0}
                    className="flex items-center gap-2 text-sm font-medium text-tc-text-secondary border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Aula Anterior
                  </button>
                  <button
                    onClick={() =>
                      setCurrentLessonIndex((i) =>
                        Math.min(flatLessons.length - 1, i + 1)
                      )
                    }
                    disabled={currentLessonIndex >= flatLessons.length - 1}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-navy-500 hover:bg-navy-600 rounded-lg px-4 py-2 transition-colors disabled:opacity-50"
                  >
                    Proxima Aula
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ========== Right column - Sidebar ========== */}
            <div className="lg:w-[35%]">
              <div className="bg-white rounded-lg border border-border">
                {/* Tab switcher */}
                <div className="flex border-b border-border">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`flex-1 text-sm font-medium py-3 text-center transition-colors ${
                      activeTab === "content"
                        ? "text-navy-500 border-b-2 border-navy-500"
                        : "text-tc-text-hint hover:text-tc-text-secondary"
                    }`}
                  >
                    Conteudo
                  </button>
                  <button
                    onClick={() => setActiveTab("resources")}
                    className={`flex-1 text-sm font-medium py-3 text-center transition-colors ${
                      activeTab === "resources"
                        ? "text-navy-500 border-b-2 border-navy-500"
                        : "text-tc-text-hint hover:text-tc-text-secondary"
                    }`}
                  >
                    Recursos
                  </button>
                </div>

                {/* Tab content */}
                <div className="p-4">
                  {activeTab === "content" && (
                    <div className="space-y-1">
                      {flatLessons.map((lesson, index) => {
                        const isCurrent = index === currentLessonIndex;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setCurrentLessonIndex(index)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                              isCurrent
                                ? "bg-navy-50 border-l-[3px] border-l-navy-500"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {/* Status icon */}
                            <div className="shrink-0">
                              {completedLessons.has(lesson.id) ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : isCurrent ? (
                                <Play className="h-5 w-5 text-navy-500 fill-navy-500" />
                              ) : lesson.type === "quiz" ? (
                                <Award className="h-5 w-5 text-amber-500" />
                              ) : (
                                <Play className="h-5 w-5 text-tc-text-hint" />
                              )}
                            </div>

                            {/* Lesson info */}
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm truncate ${
                                  isCurrent
                                    ? "font-medium text-navy-600"
                                    : "text-tc-text-primary"
                                }`}
                              >
                                {lesson.title}
                              </p>
                            </div>

                            {/* Duration */}
                            <span className="text-xs text-tc-text-hint shrink-0 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {lesson.duration_minutes
                                ? `${lesson.duration_minutes} min`
                                : "--"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {activeTab === "resources" && (
                    <div className="space-y-6">
                      {/* Material de Apoio */}
                      <div>
                        <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
                          Material de Apoio
                        </h3>
                        {resources.length === 0 ? (
                          <p className="text-sm text-tc-text-hint py-4 text-center">
                            Nenhum material disponível
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {resources.map((resource, index) => (
                              <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between border border-border rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-tc-text-primary truncate">
                                    {resource.name}
                                  </p>
                                </div>
                                <Download className="h-4 w-4 text-tc-text-hint shrink-0 ml-3" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* ---- Certificate Modal ---- */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center relative">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-tc-text-hint" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-emerald-600" />
            </div>

            <h2 className="text-xl font-bold text-tc-text-primary mb-2">
              Parabéns! Curso Concluído!
            </h2>
            <p className="text-sm text-tc-text-secondary mb-6">
              Você completou todas as {totalLessons} aulas do curso{" "}
              <span className="font-medium text-tc-text-primary">
                {course.title}
              </span>
              . Seu certificado está disponível.
            </p>

            <div className="border border-border rounded-lg p-6 mb-6 bg-warm-gray">
              <Award className="h-10 w-10 text-navy-500 mx-auto mb-3" />
              <p className="text-xs text-tc-text-hint uppercase tracking-wider mb-1">
                Certificado de Conclusão
              </p>
              <p className="text-base font-semibold text-tc-text-primary">
                {course.title}
              </p>
              <p className="text-xs text-tc-text-hint mt-1">
                {new Date().toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                to="/academy"
                className="flex-1 py-2.5 px-4 text-sm font-medium text-tc-text-secondary border border-border rounded-lg hover:bg-gray-50 transition-colors text-center"
              >
                Voltar aos Cursos
              </Link>
              <Link
                to={`/academy/courses/${id}/certificate`}
                className="flex-1 py-2.5 px-4 text-sm font-medium text-white bg-navy-500 hover:bg-navy-600 rounded-lg transition-colors text-center"
              >
                Ver Certificado
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

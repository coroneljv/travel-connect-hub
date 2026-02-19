import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_COURSE = {
  id: "1",
  title: "Atendimento ao Cliente de Excelencia",
  subtitle:
    "Domine as tecnicas de atendimento e se destaque em qualquer oportunidade de hospitalidade",
  image:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=400&fit=crop",
  level: "Iniciante",
  rating: 4.9,
  students: 3456,
  hours: 8,
  totalLessons: 24,
  language: "Portugues",
  lastUpdate: "Dezembro 2024",
  hasCertificate: true,
  about:
    "Este curso completo vai te transformar em um profissional de atendimento ao cliente, desde os fundamentos ate tecnicas avancadas de gestao de experiencias memoraveis. Aprenda a lidar com diferentes perfis de hospedes, resolver conflitos com elegancia e criar momentos que geram avaliacoes 5 estrelas.",
  modules: [
    {
      id: 1,
      title: "Fundamentos do Atendimento",
      lessonsCount: 6,
      duration: "2h 15min",
      lessons: [
        {
          title: "Introducao ao Curso",
          duration: "10:30",
          completed: true,
          type: "video" as const,
        },
        {
          title: "O que e Atendimento de Excelencia?",
          duration: "15:45",
          completed: true,
          type: "video" as const,
        },
        {
          title: "Primeiras Impressoes que Marcam",
          duration: "18:30",
          completed: true,
          type: "video" as const,
        },
        {
          title: "A Arte da Empatia",
          duration: "20:15",
          completed: false,
          type: "video" as const,
        },
        {
          title: "Comunicacao Verbal e Nao-Verbal",
          duration: "25:20",
          completed: false,
          type: "video" as const,
        },
        {
          title: "Quiz do Modulo 1",
          duration: "10:00",
          completed: false,
          type: "quiz" as const,
        },
      ],
    },
    {
      id: 2,
      title: "Comunicacao Efetiva",
      lessonsCount: 7,
      duration: "2h 30min",
      lessons: [],
    },
    {
      id: 3,
      title: "Gestao de Conflitos",
      lessonsCount: 6,
      duration: "2h 00min",
      lessons: [],
    },
    {
      id: 4,
      title: "Experiencias Memoraveis",
      lessonsCount: 6,
      duration: "2h 00min",
      lessons: [],
    },
  ],
};

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const [expandedModules, setExpandedModules] = useState<number[]>([1]);

  const course = MOCK_COURSE;

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((m) => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  return (
    <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6">
      {/* Hero Section */}
      <div className="relative w-full" style={{ minHeight: "220px" }}>
        <img
          src={course.image}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-500/80" />
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between h-full" style={{ minHeight: "220px" }}>
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
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white">
                {course.level}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-500 text-white">
                <Star className="h-3 w-3 fill-current" />
                {course.rating}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {course.title}
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-2xl">
              {course.subtitle}
            </p>

            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span className="inline-flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.students.toLocaleString("pt-BR")} alunos
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {course.hours} horas
              </span>
              <span className="inline-flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.totalLessons} aulas
              </span>
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
              Conteudo do Curso
            </h2>

            <div className="space-y-3">
              {course.modules.map((module) => {
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
                        {module.id}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-tc-text-primary">
                          {module.title}
                        </p>
                        <p className="text-xs text-tc-text-hint">
                          {module.lessonsCount} aulas &bull; {module.duration}
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
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lessonIndex}
                            className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0"
                          >
                            <div className="flex-shrink-0">
                              {lesson.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : lesson.type === "quiz" ? (
                                <span className="flex items-center justify-center w-5 h-5 text-sm">
                                  🎯
                                </span>
                              ) : (
                                <Play className="h-5 w-5 text-tc-text-hint" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-sm ${
                                  lesson.completed
                                    ? "text-tc-text-hint"
                                    : "text-tc-text-primary"
                                }`}
                              >
                                {lesson.title}
                              </p>
                            </div>
                            <span className="text-xs text-tc-text-hint flex-shrink-0">
                              {lesson.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
                <span className="text-sm text-tc-text-hint">Nivel</span>
                <span className="text-sm font-medium text-tc-text-primary">
                  {course.level}
                </span>
              </div>
              <div className="border-t border-border" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-tc-text-hint">Idioma</span>
                <span className="text-sm font-medium text-tc-text-primary">
                  {course.language}
                </span>
              </div>
              <div className="border-t border-border" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-tc-text-hint">
                  Ultima atualizacao
                </span>
                <span className="text-sm font-medium text-tc-text-primary">
                  {course.lastUpdate}
                </span>
              </div>
              <div className="border-t border-border" />

              <div className="flex items-center justify-between">
                <span className="text-sm text-tc-text-hint">Certificado</span>
                <span className="text-sm font-medium text-tc-text-primary inline-flex items-center gap-1">
                  {course.hasCertificate && (
                    <>
                      <Award className="h-4 w-4 text-amber-500" />
                      Incluso
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-tc-text-primary mb-3">
            Sobre o Curso
          </h2>
          <p className="text-sm text-tc-text-secondary leading-relaxed">
            {course.about}
          </p>
        </div>
      </div>
    </div>
  );
}

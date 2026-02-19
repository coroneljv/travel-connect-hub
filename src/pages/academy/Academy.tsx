import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { dbRoleToUIRole } from "@/lib/roles";
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
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

// TODO: substituir por query Supabase
const MOCK_COURSES = [
  {
    id: "1",
    title: "Atendimento ao Cliente de Excelencia",
    modules: 4,
    lessons: 24,
    hours: 8,
    level: "Iniciante",
    rating: 4.9,
    students: 3456,
    author: "Maria Silva",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop",
    tags: ["Mais Popular", "Certificacao", "Para Iniciantes"],
    progress: 35,
  },
  {
    id: "2",
    title: "Marketing para Hostels",
    modules: 4,
    lessons: 24,
    hours: 8,
    level: "Intermediario",
    rating: 4.7,
    students: 1200,
    author: "Roberto Gomes",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop",
    tags: ["Para Anfitrioes"],
    progress: 0,
  },
  {
    id: "3",
    title: "Gestao Financeira para Hostels",
    modules: 5,
    lessons: 30,
    hours: 10,
    level: "Avancado",
    rating: 4.8,
    students: 890,
    author: "Ana Paula Silva",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    tags: ["Gestao"],
    progress: 65,
  },
  {
    id: "4",
    title: "SEO para Acomodacoes",
    modules: 4,
    lessons: 22,
    hours: 8,
    level: "Intermediario",
    rating: 4.6,
    students: 750,
    author: "Roberto Gomes",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    tags: ["Marketing"],
    progress: 65,
  },
];

// TODO: substituir por query Supabase
const MOCK_MY_COURSES_HOST = [
  {
    id: "10",
    title: "Como Receber Viajantes Internacionais",
    modules: 4,
    lessons: 24,
    hours: 8,
    students: 34,
    revenue: 400,
    completionRate: 85,
    lastUpdated: "2 dias atras",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=400&fit=crop",
  },
  {
    id: "11",
    title: "Gestao de Hostel para Iniciantes",
    modules: 6,
    lessons: 36,
    hours: 12,
    students: 56,
    revenue: 1200,
    completionRate: 72,
    lastUpdated: "5 dias atras",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop",
  },
];

// TODO: substituir por query Supabase
const MOCK_CONTINUE_WATCHING = [
  {
    id: "1",
    title: "Atendimento ao Cliente de Excelencia",
    currentLesson: 5,
    currentLessonTitle: "Comunicacao Nao-Verbal",
    minutesRemaining: 12,
    author: "Maria Silva",
    module: "Modulo 2: Comunicacao Eficaz",
    completedLessons: 8,
    totalLessons: 24,
    progress: 33,
    nextLesson: "Aula 6: Escuta Ativa",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop",
  },
  {
    id: "3",
    title: "Gestao Financeira para Hostels",
    currentLesson: 18,
    currentLessonTitle: "Fluxo de Caixa Mensal",
    minutesRemaining: 8,
    author: "Ana Paula Silva",
    module: "Modulo 4: Controle Financeiro",
    completedLessons: 19,
    totalLessons: 30,
    progress: 63,
    nextLesson: "Aula 19: Relatorios Financeiros",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
  },
  {
    id: "4",
    title: "SEO para Acomodacoes",
    currentLesson: 14,
    currentLessonTitle: "Palavras-Chave Estrategicas",
    minutesRemaining: 15,
    author: "Roberto Gomes",
    module: "Modulo 3: Otimizacao On-Page",
    completedLessons: 14,
    totalLessons: 22,
    progress: 64,
    nextLesson: "Aula 15: Meta Descriptions",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
  },
];

// TODO: substituir por query Supabase
const MOCK_COMPLETED_COURSES = [
  {
    id: "20",
    title: "Introducao a Hospitalidade",
    author: "Carlos Mendes",
    modules: 3,
    hours: 6,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=400&fit=crop",
  },
  {
    id: "21",
    title: "Primeiros Socorros para Hospedagens",
    author: "Dra. Lucia Ferreira",
    modules: 2,
    hours: 4,
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=400&fit=crop",
  },
];

type TabKey = "descobrir" | "meus-cursos" | "meu-aprendizado";

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

function CourseCard({
  course,
  showProgress,
}: {
  course: (typeof MOCK_COURSES)[number];
  showProgress?: boolean;
}) {
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
            <span>
              {course.modules} modulos
            </span>
            <span className="text-tc-text-hint">-</span>
            <span>{course.hours}h</span>
            <span className="text-tc-text-hint">-</span>
            <span>{course.level}</span>
          </div>
          <div className="flex items-center justify-between">
            <RatingStars rating={course.rating} />
            <span className="text-xs text-tc-text-hint flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course.students.toLocaleString("pt-BR")}
            </span>
          </div>
          {showProgress && course.progress > 0 && (
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-xs text-tc-text-hint">
                <span>Progresso</span>
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
/*  TAB: Descobrir                                                     */
/* ================================================================== */
function TabDescobrir({
  uiRole,
}: {
  uiRole: "viajante" | "anfitriao" | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const heroTitle =
    uiRole === "viajante"
      ? "Trilha Profissional de Hospitalidade"
      : "Como Criar Experiencias Unicas para Viajantes";

  const heroDescription =
    uiRole === "viajante"
      ? "Desenvolva habilidades profissionais em hospitalidade e destaque-se no mercado. Aprenda com os melhores especialistas do setor."
      : "Aprenda tecnicas e estrategias para transformar seu hostel em uma experiencia inesquecivel para viajantes de todo o mundo.";

  const heroCourse = MOCK_COURSES[0];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative w-full h-[300px] rounded-xl overflow-hidden">
        <img
          src={heroCourse.image}
          alt={heroTitle}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-800/95 via-navy-700/80 to-transparent" />
        <div className="relative z-10 flex flex-col justify-center h-full px-8 max-w-2xl">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <TagBadge label="Mais Popular" />
            {uiRole === "anfitriao" ? (
              <TagBadge label="Para Anfitrioes" />
            ) : (
              <TagBadge label="Certificacao" />
            )}
            {uiRole === "anfitriao" ? (
              <TagBadge label="Gestao" />
            ) : (
              <TagBadge label="Para Iniciantes" />
            )}
          </div>
          {/* Course info */}
          <p className="text-white/70 text-sm mb-1">5 modulos - 40 horas</p>
          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
            {heroTitle}
          </h1>
          {/* Description */}
          <p className="text-white/80 text-sm mb-4 line-clamp-3">
            {heroDescription}
          </p>
          {/* Buttons */}
          <div className="flex items-center gap-3 mb-4">
            <Link
              to={`/academy/courses/${heroCourse.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy-500 text-white font-medium text-sm hover:bg-navy-600 transition-colors"
            >
              <Play className="h-4 w-4" />
              Comecar Curso
            </Link>
            <Link
              to={`/academy/courses/${heroCourse.id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-500/80 text-white font-medium text-sm hover:bg-rose-500 transition-colors"
            >
              <Info className="h-4 w-4" />
              Mais Informacoes
            </Link>
          </div>
          {/* Progress bar */}
          <div className="max-w-xs">
            <div className="flex items-center justify-between text-xs text-white/80 mb-1">
              <span>Seu progresso</span>
              <span>35%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 to-navy-500"
                style={{ width: "35%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <input
            type="text"
            placeholder="Buscar cursos, trilhas ou temas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-white text-sm text-tc-text-primary placeholder:text-tc-text-placeholder focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
          />
        </div>
        <button className="px-5 py-2.5 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-2">
          <Search className="h-4 w-4" />
          Buscar
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
            Meus Cursos
          </Link>
        )}
      </div>

      {/* Section title */}
      {uiRole === "anfitriao" ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
              <Grid3X3 className="h-5 w-5 text-rose-500" />
              Categorias
            </h2>
            <Link
              to="/academy"
              className="text-sm text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
            >
              Ver todas
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_COURSES.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
              <Play className="h-5 w-5 text-rose-500" />
              Continuar Assistindo
            </h2>
            <Link
              to="/academy"
              className="text-sm text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
            >
              Ver todos
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_COURSES.filter((c) => c.progress > 0).map((course) => (
              <CourseCard key={course.id} course={course} showProgress />
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
  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-navy-700 to-navy-500 p-8">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold text-white mb-2">
            Compartilhe seu conhecimento!
          </h2>
          <p className="text-white/80 text-sm mb-4">
            Crie cursos e compartilhe sua experiencia com viajantes e anfitrioes
            de todo o mundo. Monetize seu conhecimento.
          </p>
          <Link
            to="/academy/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-rose-500 text-white font-medium text-sm hover:bg-rose-600 transition-colors"
          >
            + Criar Novo Curso
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
              <p className="text-sm text-tc-text-hint">Total de Alunos</p>
              <p className="text-2xl font-bold text-tc-text-primary">390</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-rose-50 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <p className="text-sm text-tc-text-hint">Cursos Publicados</p>
              <p className="text-2xl font-bold text-tc-text-primary">2</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-tc-text-hint">Receita Total</p>
              <p className="text-2xl font-bold text-tc-text-primary">
                R$ 7.800
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
              <p className="text-sm text-tc-text-hint">Avaliacao Media</p>
              <p className="text-2xl font-bold text-tc-text-primary">4.8</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course list */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-tc-text-primary">
          Seus Cursos
        </h3>
        {MOCK_MY_COURSES_HOST.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-64 md:h-auto h-40 shrink-0">
                <img
                  src={course.image}
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
                    {course.modules} modulos - {course.lessons} aulas -{" "}
                    {course.hours}h - Ultima atualizacao: {course.lastUpdated}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-tc-text-secondary mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-tc-text-hint" />
                      Alunos: {course.students}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-tc-text-hint" />
                      Receita: R$ {course.revenue.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-tc-text-hint" />
                      Taxa de conclusao: {course.completionRate}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/academy/courses/${course.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-500 text-white text-sm font-medium hover:bg-navy-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalhes
                  </Link>
                  <Link
                    to={`/academy/courses/${course.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-tc-text-secondary text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </Link>
                  <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-red-600 text-sm font-medium hover:bg-red-50 transition-colors">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB: Meus Cursos (Viajante)                                        */
/* ================================================================== */
function MeusCursosViajante() {
  const enrolledCourses = MOCK_COURSES.filter((c) => c.progress > 0);

  return (
    <div className="space-y-8">
      {/* Continuar Assistindo */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
            <Play className="h-5 w-5 text-rose-500" />
            Continuar Assistindo
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CONTINUE_WATCHING.map((item) => (
            <Link
              to={`/academy/courses/${item.id}`}
              key={item.id}
              className="block group"
            >
              <Card className="overflow-hidden border border-border hover:shadow-lg transition-shadow">
                <div className="relative aspect-video">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-3">
                    <p className="text-white text-sm font-medium">
                      Aula {item.currentLesson}: {item.currentLessonTitle}
                    </p>
                    <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {item.minutesRemaining} min restantes
                    </p>
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-medium text-tc-text-primary leading-snug line-clamp-1 group-hover:text-rose-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-tc-text-hint">{item.author}</p>
                  <p className="text-xs text-tc-text-secondary">
                    {item.module}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-tc-text-hint">
                      <span>
                        {item.completedLessons}/{item.totalLessons} aulas
                      </span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-1.5" />
                  </div>
                  <p className="text-xs text-tc-text-secondary">
                    Proxima: {item.nextLesson}
                  </p>
                  <span className="text-xs text-rose-500 font-medium flex items-center gap-1 group-hover:underline">
                    Continuar
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Cursos matriculados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-rose-500" />
            Cursos Matriculados
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {enrolledCourses.map((course) => (
            <CourseCard key={course.id} course={course} showProgress />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB: Meu Aprendizado                                               */
/* ================================================================== */
function TabMeuAprendizado() {
  return (
    <div className="space-y-8">
      {/* Continuar Assistindo */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
            <Play className="h-5 w-5 text-rose-500" />
            Continuar Assistindo
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_CONTINUE_WATCHING.map((item) => (
            <Link
              to={`/academy/courses/${item.id}`}
              key={item.id}
              className="block group"
            >
              <Card className="overflow-hidden border border-border hover:shadow-lg transition-shadow">
                <div className="relative aspect-video">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-3">
                    <p className="text-white text-sm font-medium">
                      Aula {item.currentLesson}: {item.currentLessonTitle}
                    </p>
                    <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {item.minutesRemaining} min restantes
                    </p>
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-medium text-tc-text-primary leading-snug line-clamp-1 group-hover:text-rose-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-tc-text-hint">{item.author}</p>
                  <p className="text-xs text-tc-text-secondary">
                    {item.module}
                  </p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-tc-text-hint">
                      <span>
                        {item.completedLessons}/{item.totalLessons} aulas
                      </span>
                      <span>{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-1.5" />
                  </div>
                  <p className="text-xs text-tc-text-secondary">
                    Proxima: {item.nextLesson}
                  </p>
                  <span className="text-xs text-rose-500 font-medium flex items-center gap-1 group-hover:underline">
                    Continuar
                    <ChevronRight className="h-3 w-3" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Finalizados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-tc-text-primary flex items-center gap-2">
            <Award className="h-5 w-5 text-green-600" />
            Finalizados
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MOCK_COMPLETED_COURSES.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden border border-border"
            >
              <div className="relative aspect-video">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-600 text-white text-xs font-medium">
                    Finalizado &#10003;
                  </span>
                </div>
              </div>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-medium text-tc-text-primary leading-snug line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-tc-text-hint">{course.author}</p>
                <p className="text-xs text-tc-text-secondary">
                  {course.modules} modulos - {course.hours}h
                </p>
                <Link
                  to={`/academy/courses/${course.id}/certificate`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-500 text-white text-sm font-medium hover:bg-navy-600 transition-colors mt-1"
                >
                  <Award className="h-4 w-4" />
                  Ver Certificado
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Academy Page                                                  */
/* ================================================================== */
export default function Academy() {
  const { userRole } = useAuth();
  const uiRole = userRole ? dbRoleToUIRole(userRole) : null;
  const [activeTab, setActiveTab] = useState<TabKey>("descobrir");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "descobrir", label: "Descobrir" },
    { key: "meus-cursos", label: "Meus Cursos" },
    { key: "meu-aprendizado", label: "Meu Aprendizado" },
  ];

  return (
    <div className="min-h-screen bg-warm-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-tc-text-primary flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-rose-500" />
            Academy
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

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";

interface Lesson {
  name: string;
  duration: string;
  status: "completed" | "current" | "upcoming" | "quiz";
}

const lessons: Lesson[] = [
  { name: "Introducao ao Curso", duration: "10:30", status: "completed" },
  {
    name: "O que e Atendimento de Excelencia?",
    duration: "15:45",
    status: "completed",
  },
  {
    name: "Primeiras Impressoes que Marcam",
    duration: "20:15",
    status: "completed",
  },
  { name: "A Arte da Empatia", duration: "18:30", status: "completed" },
  {
    name: "Comunicacao Verbal e Nao-Verbal",
    duration: "25:20",
    status: "current",
  },
  { name: "Quiz do Modulo 1", duration: "10:00", status: "quiz" },
  {
    name: "Escuta Ativa na Pratica",
    duration: "22:15",
    status: "upcoming",
  },
  {
    name: "Linguagem Corporal Profissional",
    duration: "18:45",
    status: "upcoming",
  },
];

interface Resource {
  name: string;
  format: string;
  size: string;
}

const resources: Resource[] = [
  { name: "Checklist: Primeira Impressao", format: "PDF", size: "245 KB" },
  { name: "Templates de Boas-Vindas", format: "PDF", size: "189 KB" },
  { name: "Exercicio Pratico", format: "PDF", size: "156 KB" },
];

interface KeyPoint {
  timestamp: string;
  label: string;
}

const keyPoints: KeyPoint[] = [
  { timestamp: "0:45", label: "O poder dos primeiros 7 segundos" },
  { timestamp: "3:20", label: "Linguagem corporal acolhedora" },
  { timestamp: "7:15", label: "Sorriso genuino vs. forcado" },
  { timestamp: "12:30", label: "Recordar nomes dos hospedes" },
  { timestamp: "16:45", label: "Checklist de boas-vindas" },
];

export default function WatchCourse() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"content" | "resources">(
    "content"
  );
  const [currentLessonIndex, setCurrentLessonIndex] = useState(4);

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
              Atendimento ao Cliente de Excelencia
            </span>
            <span className="text-sm text-tc-text-hint">
              Aula 4 de 24 &bull; Modulo 1: Fundamentos do Atendimento
            </span>
          </div>

          {/* Right: progress badge */}
          <span className="bg-rose-500 text-white text-xs font-medium rounded-lg px-3 py-1">
            13% Completo
          </span>
        </div>
      </div>

      {/* ---- Main area ---- */}
      <div className="max-w-[1440px] mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* ========== Left column - Video + Info ========== */}
          <div className="flex-1 lg:w-[65%] space-y-4">
            {/* Video placeholder */}
            <div className="relative">
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1280&h=720&fit=crop"
                  alt="Aula em andamento"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <Play className="h-8 w-8 text-white fill-white" />
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1 bg-gray-700 rounded-b-lg overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-b-lg"
                  style={{ width: "25%" }}
                />
              </div>
            </div>

            {/* Video controls bar */}
            <div className="bg-white rounded-lg border border-border px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                  <SkipBack className="h-4 w-4 text-tc-text-secondary" />
                </button>
                <button className="p-1.5 rounded-full bg-navy-500 hover:bg-navy-600 transition-colors">
                  <Play className="h-4 w-4 text-white fill-white" />
                </button>
                <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                  <SkipForward className="h-4 w-4 text-tc-text-secondary" />
                </button>
                <button className="p-1.5 rounded hover:bg-gray-100 transition-colors">
                  <Volume2 className="h-4 w-4 text-tc-text-secondary" />
                </button>
                <span className="text-xs text-tc-text-hint font-medium ml-1">
                  5:04 / 20:15
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
                Excelencia em Momentos Criticos
              </h2>
              <p className="text-sm text-tc-text-secondary leading-relaxed">
                Aprenda como lidar com situacoes dificeis e criticas com
                profissionalismo e eficacia, transformando desafios em
                oportunidades para impressionar os hospedes e fortalecer a
                reputacao do seu estabelecimento.
              </p>

              {/* Info badge */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <p className="text-sm text-amber-800">
                  <span className="mr-1">&#127891;</span>
                  Ultima aula de conteudo! Apos concluir, voce fara o quiz e a
                  prova final{" "}
                  <span className="ml-1">&#127919;</span>
                </p>
              </div>

              {/* Complete button */}
              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <CheckCircle2 className="h-5 w-5" />
                Concluir e Continuar
              </button>

              {/* Bottom navigation */}
              <div className="flex items-center justify-between pt-2">
                <button className="flex items-center gap-2 text-sm font-medium text-tc-text-secondary border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                  Aula Anterior
                </button>
                <button className="flex items-center gap-2 text-sm font-medium text-white bg-navy-500 hover:bg-navy-600 rounded-lg px-4 py-2 transition-colors">
                  Ir para o Quiz Final
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
                    {lessons.map((lesson, index) => {
                      const isCurrent = index === currentLessonIndex;

                      return (
                        <button
                          key={index}
                          onClick={() => setCurrentLessonIndex(index)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            isCurrent
                              ? "bg-navy-50 border-l-[3px] border-l-navy-500"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {/* Status icon */}
                          <div className="shrink-0">
                            {lesson.status === "completed" && (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            )}
                            {lesson.status === "current" && (
                              <Play className="h-5 w-5 text-navy-500 fill-navy-500" />
                            )}
                            {lesson.status === "upcoming" && (
                              <Play className="h-5 w-5 text-tc-text-hint" />
                            )}
                            {lesson.status === "quiz" && (
                              <Award className="h-5 w-5 text-amber-500" />
                            )}
                          </div>

                          {/* Lesson info */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm truncate ${
                                isCurrent
                                  ? "font-medium text-navy-600"
                                  : lesson.status === "completed"
                                  ? "text-tc-text-secondary"
                                  : "text-tc-text-primary"
                              }`}
                            >
                              {lesson.name}
                            </p>
                          </div>

                          {/* Duration */}
                          <span className="text-xs text-tc-text-hint shrink-0 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {lesson.duration}
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
                      <div className="space-y-2">
                        {resources.map((resource, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between border border-border rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-tc-text-primary truncate">
                                {resource.name}
                              </p>
                              <p className="text-xs text-tc-text-hint">
                                {resource.format} &bull; {resource.size}
                              </p>
                            </div>
                            <Download className="h-4 w-4 text-tc-text-hint shrink-0 ml-3" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pontos-Chave da Aula */}
                    <div>
                      <h3 className="text-sm font-semibold text-tc-text-primary mb-3">
                        Pontos-Chave da Aula
                      </h3>
                      <div className="space-y-2">
                        {keyPoints.map((point, index) => (
                          <button
                            key={index}
                            className="w-full flex items-center gap-3 text-left hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                          >
                            <span className="shrink-0 text-xs font-medium text-emerald-700 bg-emerald-100 rounded px-2 py-0.5">
                              {point.timestamp}
                            </span>
                            <span className="text-sm text-tc-text-secondary">
                              {point.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import {
  HelpCircle,
  Clock,
  Star,
  RefreshCw,
  CheckCircle2,
  BookOpen,
  Zap,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function QuizPage() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-lg border overflow-hidden shadow-sm">
        <div className="grid md:grid-cols-[45%_55%]">
          {/* Left - Image Section */}
          <div className="relative hidden md:block min-h-[600px]">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
              alt="Quiz do curso"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-800/60 to-navy-700/30" />

            {/* Bottom overlay with course info */}
            <div className="absolute bottom-0 left-0 right-0 p-5 space-y-4">
              <div>
                <h2 className="text-white font-bold text-lg leading-snug">
                  Quiz Final do Curso
                </h2>
                <p className="text-white/80 text-sm mt-1">
                  Atendimento ao Cliente de Excelência
                </p>
              </div>

              {/* 2x2 tip cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-navy-500/90 rounded p-2.5">
                  <p className="text-white text-xs font-semibold leading-tight">
                    Foque no aprendizado
                  </p>
                  <p className="text-white/70 text-[10px] mt-0.5 leading-tight">
                    Cada questão é uma oportunidade de fixar o conteúdo
                  </p>
                </div>
                <div className="bg-navy-500/90 rounded p-2.5">
                  <p className="text-white text-xs font-semibold leading-tight">
                    Leia com atenção
                  </p>
                  <p className="text-white/70 text-[10px] mt-0.5 leading-tight">
                    Reserve tempo para entender cada alternativa
                  </p>
                </div>
                <div className="bg-navy-500/90 rounded p-2.5">
                  <p className="text-white text-xs font-semibold leading-tight">
                    Evolua sempre
                  </p>
                  <p className="text-white/70 text-[10px] mt-0.5 leading-tight">
                    Use as explicações para melhorar seu desempenho
                  </p>
                </div>
                <div className="bg-navy-500/90 rounded p-2.5">
                  <p className="text-white text-xs font-semibold leading-tight">
                    Após aprovação
                  </p>
                  <p className="text-white/70 text-[10px] mt-0.5 leading-tight">
                    Continue para a prova final do curso
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Info Section */}
          <div className="p-6 md:p-8 flex flex-col gap-5">
            {/* Badge */}
            <div>
              <span className="inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-medium text-navy-500">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Quiz Final
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-xl font-bold text-tc-text-heading">
                Teste seus conhecimentos
              </h1>
              <p className="text-sm text-tc-text-secondary mt-2 leading-relaxed">
                Teste seus conhecimentos sobre os conceitos aprendidos neste
                módulo. Você precisa acertar 60% para prosseguir.
              </p>
            </div>

            {/* Stats grid 2x2 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 rounded-lg border p-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-navy-50">
                  <HelpCircle className="w-4 h-4 text-navy-500" />
                </div>
                <div>
                  <p className="text-[11px] text-tc-text-hint leading-none">
                    Questões
                  </p>
                  <p className="text-sm font-bold text-tc-text-primary mt-0.5">
                    10
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border p-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-navy-50">
                  <Clock className="w-4 h-4 text-navy-500" />
                </div>
                <div>
                  <p className="text-[11px] text-tc-text-hint leading-none">
                    Tempo limite
                  </p>
                  <p className="text-sm font-bold text-tc-text-primary mt-0.5">
                    10 min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border p-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-navy-50">
                  <Star className="w-4 h-4 text-navy-500" />
                </div>
                <div>
                  <p className="text-[11px] text-tc-text-hint leading-none">
                    Nota mínima
                  </p>
                  <p className="text-sm font-bold text-tc-text-primary mt-0.5">
                    60%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 rounded-lg border p-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-navy-50">
                  <RefreshCw className="w-4 h-4 text-navy-500" />
                </div>
                <div>
                  <p className="text-[11px] text-tc-text-hint leading-none">
                    Tentativas
                  </p>
                  <p className="text-sm font-bold text-tc-text-primary mt-0.5">
                    &infin;
                  </p>
                </div>
              </div>
            </div>

            {/* Feature cards */}
            <div className="space-y-2">
              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-green-50 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-tc-text-primary">
                    Feedback Imediato
                  </p>
                  <p className="text-xs text-tc-text-hint mt-0.5">
                    Veja se acertou após cada resposta
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-tc-text-primary">
                    Explicações Detalhadas
                  </p>
                  <p className="text-xs text-tc-text-hint mt-0.5">
                    Aprenda com cada questão
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-md bg-amber-50 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-tc-text-primary">
                    Sem Pressão
                  </p>
                  <p className="text-xs text-tc-text-hint mt-0.5">
                    Tente quantas vezes quiser
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 mt-auto pt-2">
              <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-purple-500 text-white font-semibold py-3 px-4 text-sm hover:opacity-90 transition-opacity">
                Iniciar Quiz
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to={`/academy/courses/${id}`}
                className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-white text-tc-text-secondary font-medium py-3 px-4 text-sm hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Curso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

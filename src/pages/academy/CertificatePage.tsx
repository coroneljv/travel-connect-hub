import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Star,
  Download,
  Share2,
} from "lucide-react";

export default function CertificatePage() {
  const { id } = useParams();

  const skills = [
    "Atendimento ao Cliente",
    "Comunicação",
    "Resolução de Conflitos",
    "Gestão de Experiências",
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      {/* Back link */}
      <div className="max-w-2xl mx-auto mb-6">
        <Link
          to="/academy"
          className="inline-flex items-center gap-1.5 text-sm text-tc-text-secondary hover:text-tc-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos Cursos
        </Link>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-tc-text-heading">
          Parabéns! 🎉
        </h1>
        <p className="text-tc-text-secondary mt-2">
          Você concluiu o curso com sucesso!
        </p>
      </div>

      {/* Certificate Card */}
      <div className="max-w-2xl mx-auto border rounded-xl shadow-lg p-8 bg-white relative overflow-hidden">
        {/* Rose gradient decorative element - top left corner */}
        <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 opacity-20 blur-sm" />

        {/* Award icon */}
        <div className="relative flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center">
            <Award className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Certificate title */}
        <div className="relative text-center mb-1">
          <p className="text-sm tracking-widest text-tc-text-hint uppercase font-semibold">
            CERTIFICADO DE CONCLUSÃO
          </p>
        </div>

        <p className="relative text-center text-sm text-tc-text-secondary mb-6">
          Academia de Viajantes
        </p>

        {/* Divider */}
        <div className="relative border-t border-dashed my-6" />

        {/* Recipient */}
        <div className="relative text-center space-y-1 mb-2">
          <p className="text-sm text-tc-text-secondary">
            Este certificado é concedido a
          </p>
          <p className="text-3xl font-bold text-tc-text-heading">Luciane</p>
        </div>

        {/* Course */}
        <div className="relative text-center space-y-1 mb-6">
          <p className="text-sm text-tc-text-secondary">
            Por completar com sucesso o curso
          </p>
          <p className="text-xl font-bold text-tc-text-heading">
            Atendimento ao Cliente de Excelência
          </p>
        </div>

        {/* Date, hours, grade */}
        <div className="relative flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-tc-text-secondary mb-8">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            22 de Dezembro de 2024
          </span>
          <span className="text-tc-text-hint">•</span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            8 horas de conteúdo
          </span>
          <span className="text-tc-text-hint">•</span>
          <span className="inline-flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            Nota: 95%
          </span>
        </div>

        {/* Divider */}
        <div className="relative border-t border-dashed my-6" />

        {/* Skills */}
        <div className="relative mb-8">
          <p className="text-sm font-semibold text-tc-text-primary text-center mb-3">
            Habilidades Desenvolvidas
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-navy-500 bg-navy-50"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Instructor */}
        <div className="relative flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] text-tc-text-hint uppercase tracking-wide">
              Instrutor
            </p>
            <p className="text-sm font-semibold text-tc-text-primary mt-0.5">
              Maria Silva
            </p>
          </div>
          {/* Progress circle decoration */}
          <div className="w-10 h-10 rounded-full border-4 border-rose-200 border-t-rose-500 animate-none" />
        </div>

        {/* Certificate ID */}
        <div className="relative text-center border-t pt-4">
          <p className="text-[11px] text-tc-text-hint uppercase tracking-wide">
            ID do Certificado
          </p>
          <p className="text-sm font-mono text-tc-text-secondary mt-0.5">
            AC-2024-123456
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="max-w-2xl mx-auto mt-6 flex items-center justify-center gap-3">
        <button className="inline-flex items-center gap-2 rounded-lg bg-navy-500 text-white font-semibold py-3 px-6 text-sm hover:bg-navy-600 transition-colors">
          <Download className="w-4 h-4" />
          Baixar Certificado
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-white text-tc-text-secondary font-semibold py-3 px-6 text-sm hover:bg-gray-50 transition-colors">
          <Share2 className="w-4 h-4" />
          Compartilhar
        </button>
      </div>
    </div>
  );
}

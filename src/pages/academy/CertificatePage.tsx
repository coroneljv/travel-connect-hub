import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Award,
  Calendar,
  CheckCircle2,
  Star,
  Download,
  Share2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function CertificatePage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);

  const [course, setCourse] = useState<{
    title: string;
    instructor_name: string | null;
    updated_at: string | null;
  } | null>(null);
  const [totalLessons, setTotalLessons] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);

      const { data: courseData } = await supabase
        .from("courses")
        .select("title, instructor_name, updated_at")
        .eq("id", id)
        .single();

      if (courseData) setCourse(courseData);

      const { data: modules } = await supabase
        .from("course_modules")
        .select("id")
        .eq("course_id", id);

      const moduleIds = (modules || []).map((m: { id: string }) => m.id);
      if (moduleIds.length > 0) {
        const { data: lessons } = await supabase
          .from("course_lessons")
          .select("id, duration_minutes")
          .in("module_id", moduleIds);

        const list = lessons || [];
        setTotalLessons(list.length);
        setTotalMinutes(
          list.reduce((s: number, l: any) => s + (l.duration_minutes || 0), 0)
        );
      }

      setLoading(false);
    }
    fetchData();
  }, [id]);

  const userName = profile?.full_name || "Aluno";
  const completionDate = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const totalHours = Math.max(1, Math.round(totalMinutes / 60));
  const certId = `AC-${new Date().getFullYear()}-${id?.slice(0, 6).toUpperCase()}`;

  const handleDownload = () => {
    if (!certRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Permita popups para baixar o certificado.");
      return;
    }
    const instructorBlock = course?.instructor_name
      ? `<div class="instructor">
           <p class="instructor-label">INSTRUTOR</p>
           <p class="instructor-name">${course.instructor_name}</p>
         </div>`
      : "";
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Certificado - ${course?.title || "Curso"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 landscape; margin: 0; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #f5f4f0; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .cert { width: 100%; max-width: 800px; background: white; border-radius: 16px; padding: 56px 48px; position: relative; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
    .blob { position: absolute; top: -80px; left: -80px; width: 220px; height: 220px; border-radius: 50%; background: linear-gradient(135deg, #fb7185, #e11d48); opacity: 0.15; filter: blur(2px); }
    .icon-wrap { position: relative; text-align: center; margin-bottom: 20px; }
    .icon-circle { display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 72px; border-radius: 50%; background: #DC3545; }
    .icon-circle svg { width: 36px; height: 36px; fill: none; stroke: white; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .title-label { position: relative; text-align: center; font-size: 12px; text-transform: uppercase; letter-spacing: 4px; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
    .title-sub { position: relative; text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 28px; }
    .divider { position: relative; border-top: 1px dashed #d1d5db; margin: 28px 0; }
    .granted { position: relative; text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 4px; }
    .user-name { position: relative; text-align: center; font-size: 34px; font-weight: 700; color: #1f2937; margin-bottom: 20px; }
    .course-label { position: relative; text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 4px; }
    .course-name { position: relative; text-align: center; font-size: 22px; font-weight: 700; color: #1f2937; margin-bottom: 28px; }
    .meta { position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 14px; color: #6b7280; margin-bottom: 28px; flex-wrap: wrap; }
    .meta-item { display: inline-flex; align-items: center; gap: 4px; }
    .meta-item svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .meta-dot { color: #d1d5db; }
    .instructor { position: relative; text-align: center; margin-bottom: 28px; }
    .instructor-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; font-weight: 600; margin-bottom: 4px; }
    .instructor-name { font-size: 15px; font-weight: 600; color: #1f2937; }
    .cert-id-wrap { position: relative; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    .cert-id-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; font-weight: 600; }
    .cert-id-value { font-family: 'Courier New', monospace; font-size: 14px; color: #6b7280; margin-top: 4px; }
    @media print {
      body { background: white; padding: 0; min-height: auto; }
      .cert { box-shadow: none; border: none; max-width: 100%; border-radius: 0; }
    }
  </style>
</head>
<body>
  <div class="cert">
    <div class="blob"></div>
    <div class="icon-wrap">
      <div class="icon-circle">
        <svg viewBox="0 0 24 24"><path d="M12 15l-3 3h6l-3-3z"/><circle cx="12" cy="8" r="6"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>
      </div>
    </div>
    <p class="title-label">CERTIFICADO DE CONCLUSÃO</p>
    <p class="title-sub">Academia de Viajantes</p>
    <div class="divider"></div>
    <p class="granted">Este certificado é concedido a</p>
    <p class="user-name">${userName}</p>
    <p class="course-label">Por completar com sucesso o curso</p>
    <p class="course-name">${course?.title || "Curso"}</p>
    <div class="meta">
      <span class="meta-item">
        <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${completionDate}
      </span>
      <span class="meta-dot">&bull;</span>
      <span class="meta-item">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${totalHours} horas de conteúdo
      </span>
      <span class="meta-dot">&bull;</span>
      <span class="meta-item">
        <svg viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
        ${totalLessons} aulas concluídas
      </span>
    </div>
    ${instructorBlock}
    <div class="cert-id-wrap">
      <p class="cert-id-label">ID DO CERTIFICADO</p>
      <p class="cert-id-value">${certId}</p>
    </div>
  </div>
  <script>window.onload=function(){window.print();}</script>
</body>
</html>`);
    printWindow.document.close();
  };

  const handleShare = async () => {
    const shareData = {
      title: `Certificado - ${course?.title}`,
      text: `Concluí o curso "${course?.title}" na Academia de Viajantes!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copiado para a área de transferência!");
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

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
      <div
        ref={certRef}
        className="max-w-2xl mx-auto border rounded-xl shadow-lg p-8 bg-white relative overflow-hidden"
      >
        {/* Rose gradient decorative element */}
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
          <p className="text-3xl font-bold text-tc-text-heading">{userName}</p>
        </div>

        {/* Course */}
        <div className="relative text-center space-y-1 mb-6">
          <p className="text-sm text-tc-text-secondary">
            Por completar com sucesso o curso
          </p>
          <p className="text-xl font-bold text-tc-text-heading">
            {course?.title || "Curso"}
          </p>
        </div>

        {/* Date, hours, lessons */}
        <div className="relative flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-tc-text-secondary mb-8">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {completionDate}
          </span>
          <span className="text-tc-text-hint">&bull;</span>
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {totalHours} horas de conteúdo
          </span>
          <span className="text-tc-text-hint">&bull;</span>
          <span className="inline-flex items-center gap-1">
            <Star className="w-3.5 h-3.5" />
            {totalLessons} aulas concluídas
          </span>
        </div>

        {/* Divider */}
        <div className="relative border-t border-dashed my-6" />

        {/* Instructor */}
        {course?.instructor_name && (
          <div className="relative text-center mb-6">
            <p className="text-[11px] text-tc-text-hint uppercase tracking-wide">
              Instrutor
            </p>
            <p className="text-sm font-semibold text-tc-text-primary mt-0.5">
              {course.instructor_name}
            </p>
          </div>
        )}

        {/* Certificate ID */}
        <div className="relative text-center border-t pt-4">
          <p className="text-[11px] text-tc-text-hint uppercase tracking-wide">
            ID do Certificado
          </p>
          <p className="text-sm font-mono text-tc-text-secondary mt-0.5">
            {certId}
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="max-w-2xl mx-auto mt-6 flex items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 rounded-lg bg-navy-500 text-white font-semibold py-3 px-6 text-sm hover:bg-navy-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          Baixar Certificado
        </button>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white text-tc-text-secondary font-semibold py-3 px-6 text-sm hover:bg-gray-50 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Compartilhar
        </button>
      </div>
    </div>
  );
}

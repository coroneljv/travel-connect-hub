import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  BookOpen,
  Target,
  Layout,
  HelpCircle,
  FileText,
  DollarSign,
  User,
  Plus,
  X,
  Upload,
  Video,
  Image,
  Globe,
  Award,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CoursePublishedModal from "@/components/modals/CoursePublishedModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile, uploadFiles } from "@/lib/storage";
import { compressVideo } from "@/lib/video-compress";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Lesson {
  title: string;
  description: string;
  type: string;
  videoFile: File | null;
  materialFile: File | null;
}

interface Module {
  title: string;
  lessons: Lesson[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

interface ModuleQuiz {
  enabled: boolean;
  questions: QuizQuestion[];
}

interface FinalExam {
  enabled: boolean;
  questions: QuizQuestion[];
}

/* ------------------------------------------------------------------ */
/*  Step definitions                                                   */
/* ------------------------------------------------------------------ */

const STEP_META = [
  { label: "Informações Básicas", icon: BookOpen },
  { label: "Descrição e Objetivos", icon: Target },
  { label: "Conteúdo do Curso", icon: Layout },
  { label: "Quizzes e Avaliações", icon: HelpCircle },
  { label: "Materiais e Recursos", icon: FileText },
  { label: "Precificação", icon: DollarSign },
  { label: "Sobre", icon: User },
];

/* ------------------------------------------------------------------ */
/*  Helper: empty creators                                             */
/* ------------------------------------------------------------------ */

function emptyLesson(): Lesson {
  return { title: "", description: "", type: "video", videoFile: null, materialFile: null };
}

function emptyModule(): Module {
  return { title: "", lessons: [emptyLesson()] };
}

function emptyQuestion(): QuizQuestion {
  return { question: "", options: ["", "", "", ""], correctIndex: 1 };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CreateCourse() {
  const navigate = useNavigate();
  const { user, organization } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);

  /* ---- wizard step ---- */
  const [step, setStep] = useState(0);

  /* ---- Step 1 – Informações Básicas ---- */
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [subcategoria, setSubcategoria] = useState("");
  const [idioma, setIdioma] = useState("");
  const [nivel, setNivel] = useState("");

  /* ---- Step 2 – Descrição e Objetivos ---- */
  const [descricao, setDescricao] = useState("");
  const [objetivos, setObjetivos] = useState(["", "", "", ""]);
  const [requisitos, setRequisitos] = useState<string[]>([]);
  const [publicoAlvo, setPublicoAlvo] = useState("");

  /* ---- Step 3 – Conteúdo do Curso ---- */
  const [modules, setModules] = useState<Module[]>([emptyModule()]);

  /* ---- Step 4 – Quizzes e Avaliações ---- */
  const [moduleQuizzes, setModuleQuizzes] = useState<ModuleQuiz[]>([
    { enabled: false, questions: [emptyQuestion()] },
  ]);
  const [finalExam, setFinalExam] = useState<FinalExam>({
    enabled: false,
    questions: [emptyQuestion()],
  });

  /* ---- Step 5 – Materiais e Recursos ---- */
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [supportMaterials, setSupportMaterials] = useState<File[]>([]);

  /* ---- Step 6 – Precificação ---- */
  const [pricingType, setPricingType] = useState<"free" | "paid">("paid");
  const [moeda, setMoeda] = useState("BRL");
  const [preco, setPreco] = useState("");

  /* ---- Step 7 – Sobre ---- */
  const [instructorPhoto, setInstructorPhoto] = useState<File | null>(null);
  const [biografia, setBiografia] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");

  /* ---- Publish modal ---- */
  const [showPublished, setShowPublished] = useState(false);

  /* ================================================================ */
  /*  Navigation helpers                                               */
  /* ================================================================ */

  const goNext = () => {
    if (step < 6) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handlePublish = async () => {
    if (!user || !organization) {
      toast.error("Você precisa estar logado");
      return;
    }

    setIsPublishing(true);
    try {
      // Upload cover image
      let coverImageUrl: string | null = null;
      if (coverImage) {
        coverImageUrl = await uploadFile(coverImage, "courses/covers");
      }

      // Upload instructor photo
      let instructorPhotoUrl: string | null = null;
      if (instructorPhoto) {
        instructorPhotoUrl = await uploadFile(instructorPhoto, "courses/instructors");
      }

      // Upload support materials
      let supportMaterialUrls: string[] = [];
      if (supportMaterials.length > 0) {
        supportMaterialUrls = await uploadFiles(supportMaterials, "courses/materials");
      }

      // Build quiz data as JSON
      const quizData = {
        moduleQuizzes: moduleQuizzes.filter(q => q.enabled),
        finalExam: finalExam.enabled ? finalExam : null,
      };

      // Insert course
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .insert({
          created_by: user.id,
          organization_id: organization.id,
          title: titulo,
          subtitle: subtitulo || null,
          description: descricao || null,
          category: categoria || null,
          subcategory: subcategoria || null,
          language: idioma || "Português",
          level: nivel || null,
          cover_image_url: coverImageUrl,
          objectives: objetivos.filter(o => o.trim()),
          prerequisites: requisitos.filter(r => r.trim()),
          target_audience: publicoAlvo || null,
          pricing_type: pricingType,
          currency: moeda,
          price: pricingType === "paid" && preco ? parseFloat(preco) : 0,
          instructor_name: user.user_metadata?.full_name || null,
          instructor_bio: biografia || null,
          instructor_photo_url: instructorPhotoUrl,
          instructor_linkedin: linkedin || null,
          instructor_instagram: instagram || null,
          instructor_website: website || null,
          quiz_data: quizData as any,
          support_material_urls: supportMaterialUrls.length > 0 ? supportMaterialUrls : null,
          status: "published",
        } as any)
        .select("id")
        .single();

      if (courseError) throw courseError;

      // Insert modules + lessons
      for (let mi = 0; mi < modules.length; mi++) {
        const mod = modules[mi];
        if (!mod.title.trim()) continue;

        const { data: modData, error: modError } = await supabase
          .from("course_modules")
          .insert({
            course_id: courseData.id,
            title: mod.title,
            sort_order: mi,
          } as any)
          .select("id")
          .single();

        if (modError) throw modError;

        for (let li = 0; li < mod.lessons.length; li++) {
          const lesson = mod.lessons[li];
          if (!lesson.title.trim()) continue;

          let videoUrl: string | null = null;
          if (lesson.videoFile) {
            const compressToastId = toast.loading("Comprimindo vídeo...", {
              description: "0%",
            });
            const compressed = await compressVideo(lesson.videoFile, (pct) => {
              toast.loading("Comprimindo vídeo...", {
                id: compressToastId,
                description: `${pct}%`,
              });
            });
            toast.dismiss(compressToastId);
            videoUrl = await uploadFile(compressed, "courses/videos");
          }

          let materialUrl: string | null = null;
          if (lesson.materialFile) {
            materialUrl = await uploadFile(lesson.materialFile, "courses/lesson-materials");
          }

          await supabase.from("course_lessons").insert({
            module_id: modData.id,
            title: lesson.title,
            description: lesson.description || null,
            type: lesson.type || "video",
            video_url: videoUrl,
            material_url: materialUrl,
            sort_order: li,
          } as any);
        }
      }

      toast.success("Curso publicado com sucesso!");
      setShowPublished(true);
    } catch (error: any) {
      toast.error(error.message || "Erro ao publicar curso");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleClosePublished = () => {
    setShowPublished(false);
    navigate("/academy");
  };

  /* ================================================================ */
  /*  Module / Lesson helpers                                          */
  /* ================================================================ */

  const updateModule = (idx: number, patch: Partial<Module>) => {
    setModules((prev) => prev.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  };

  const addModule = () => {
    setModules((prev) => [...prev, emptyModule()]);
    setModuleQuizzes((prev) => [...prev, { enabled: false, questions: [emptyQuestion()] }]);
  };

  const removeModule = (idx: number) => {
    if (modules.length <= 1) return;
    setModules((prev) => prev.filter((_, i) => i !== idx));
    setModuleQuizzes((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateLesson = (mIdx: number, lIdx: number, patch: Partial<Lesson>) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === mIdx
          ? {
              ...m,
              lessons: m.lessons.map((l, li) => (li === lIdx ? { ...l, ...patch } : l)),
            }
          : m,
      ),
    );
  };

  const addLesson = (mIdx: number) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === mIdx ? { ...m, lessons: [...m.lessons, emptyLesson()] } : m,
      ),
    );
  };

  const removeLesson = (mIdx: number, lIdx: number) => {
    setModules((prev) =>
      prev.map((m, mi) =>
        mi === mIdx
          ? { ...m, lessons: m.lessons.filter((_, li) => li !== lIdx) }
          : m,
      ),
    );
  };

  /* ================================================================ */
  /*  Quiz helpers                                                     */
  /* ================================================================ */

  const toggleModuleQuiz = (mIdx: number) => {
    setModuleQuizzes((prev) =>
      prev.map((q, i) => (i === mIdx ? { ...q, enabled: !q.enabled } : q)),
    );
  };

  const updateQuizQuestion = (
    mIdx: number,
    qIdx: number,
    patch: Partial<QuizQuestion>,
  ) => {
    setModuleQuizzes((prev) =>
      prev.map((mq, mi) =>
        mi === mIdx
          ? {
              ...mq,
              questions: mq.questions.map((q, qi) =>
                qi === qIdx ? { ...q, ...patch } : q,
              ),
            }
          : mq,
      ),
    );
  };

  const updateQuizOption = (mIdx: number, qIdx: number, oIdx: number, value: string) => {
    setModuleQuizzes((prev) =>
      prev.map((mq, mi) =>
        mi === mIdx
          ? {
              ...mq,
              questions: mq.questions.map((q, qi) =>
                qi === qIdx
                  ? { ...q, options: q.options.map((o, oi) => (oi === oIdx ? value : o)) }
                  : q,
              ),
            }
          : mq,
      ),
    );
  };

  const addQuizQuestion = (mIdx: number) => {
    setModuleQuizzes((prev) =>
      prev.map((mq, mi) =>
        mi === mIdx ? { ...mq, questions: [...mq.questions, emptyQuestion()] } : mq,
      ),
    );
  };

  const toggleFinalExam = () => {
    setFinalExam((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const updateFinalQuestion = (qIdx: number, patch: Partial<QuizQuestion>) => {
    setFinalExam((prev) => ({
      ...prev,
      questions: prev.questions.map((q, qi) => (qi === qIdx ? { ...q, ...patch } : q)),
    }));
  };

  const updateFinalOption = (qIdx: number, oIdx: number, value: string) => {
    setFinalExam((prev) => ({
      ...prev,
      questions: prev.questions.map((q, qi) =>
        qi === qIdx
          ? { ...q, options: q.options.map((o, oi) => (oi === oIdx ? value : o)) }
          : q,
      ),
    }));
  };

  const addFinalQuestion = () => {
    setFinalExam((prev) => ({ ...prev, questions: [...prev.questions, emptyQuestion()] }));
  };

  /* ================================================================ */
  /*  Objectives / Requirements helpers                                */
  /* ================================================================ */

  const updateObjective = (idx: number, value: string) => {
    setObjetivos((prev) => prev.map((o, i) => (i === idx ? value : o)));
  };

  const addObjective = () => {
    setObjetivos((prev) => [...prev, ""]);
  };

  const removeObjective = (idx: number) => {
    if (objetivos.length <= 4) return;
    setObjetivos((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRequirement = (idx: number, value: string) => {
    setRequisitos((prev) => prev.map((r, i) => (i === idx ? value : r)));
  };

  const addRequirement = () => {
    setRequisitos((prev) => [...prev, ""]);
  };

  const removeRequirement = (idx: number) => {
    setRequisitos((prev) => prev.filter((_, i) => i !== idx));
  };

  /* ================================================================ */
  /*  Render: Step Indicator                                           */
  /* ================================================================ */

  const renderStepIndicator = () => (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {STEP_META.map((s, i) => {
        const Icon = s.icon;
        const isCompleted = i < step;
        const isCurrent = i === step;
        const isPending = i > step;

        return (
          <div key={i} className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              onClick={() => i <= step && setStep(i)}
              className="flex flex-col items-center gap-1 min-w-[72px] cursor-pointer"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-rose-500 text-white"
                      : "bg-gray-200 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={`text-[10px] leading-tight text-center ${
                  isCurrent
                    ? "text-rose-500 font-semibold"
                    : isCompleted
                      ? "text-emerald-600 font-medium"
                      : "text-tc-text-hint"
                }`}
              >
                {s.label}
              </span>
            </button>

            {i < STEP_META.length - 1 && (
              <div
                className={`h-px w-4 flex-shrink-0 ${
                  i < step ? "bg-emerald-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  /* ================================================================ */
  /*  Render: Step 1 – Informações Básicas                             */
  /* ================================================================ */

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-tc-text-primary">Informações Básicas</h2>
        <p className="text-sm text-tc-text-hint mt-1">
          Vamos começar com as informações essenciais do seu curso
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-tc-text-primary">
            Título do Curso<span className="text-rose-500">*</span>
          </Label>
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value.slice(0, 60))}
            placeholder="Ex: Atendimento ao Cliente de Excelência"
            className="mt-1"
            maxLength={60}
          />
          <p className="text-xs text-tc-text-hint mt-1">{titulo.length}/60 caracteres</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-tc-text-primary">
            Subtítulo<span className="text-rose-500">*</span>
          </Label>
          <Input
            value={subtitulo}
            onChange={(e) => setSubtitulo(e.target.value.slice(0, 120))}
            placeholder="Breve descrição que aparecerá abaixo do título"
            className="mt-1"
            maxLength={120}
          />
          <p className="text-xs text-tc-text-hint mt-1">{subtitulo.length}/120 caracteres</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-tc-text-primary">
              Categoria<span className="text-rose-500">*</span>
            </Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hospitalidade">Hospitalidade</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="gestao">Gestão</SelectItem>
                <SelectItem value="idiomas">Idiomas</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-tc-text-primary">
              Subcategoria<span className="text-rose-500">*</span>
            </Label>
            <Select value={subcategoria} onValueChange={setSubcategoria}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione a subcategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atendimento">Atendimento</SelectItem>
                <SelectItem value="recepcao">Recepção</SelectItem>
                <SelectItem value="gestao-hostel">Gestão de Hostel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-tc-text-primary">
              Idioma<span className="text-rose-500">*</span>
            </Label>
            <Select value={idioma} onValueChange={setIdioma}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt">Português</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-tc-text-primary">
              Nível<span className="text-rose-500">*</span>
            </Label>
            <Select value={nivel} onValueChange={setNivel}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="iniciante">Iniciante</SelectItem>
                <SelectItem value="intermediario">Intermediário</SelectItem>
                <SelectItem value="avancado">Avançado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  /* ================================================================ */
  /*  Render: Step 2 – Descrição e Objetivos                           */
  /* ================================================================ */

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-tc-text-primary">Descrição e Objetivos</h2>
        <p className="text-sm text-tc-text-hint mt-1">
          Descreva seu curso e defina os objetivos de aprendizagem
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-tc-text-primary">
            Descrição do Curso<span className="text-rose-500">*</span>
          </Label>
          <Textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value.slice(0, 200))}
            placeholder="Descreva detalhadamente o que seu curso aborda..."
            className="mt-1 min-h-[100px]"
            maxLength={200}
          />
          <p className="text-xs text-tc-text-hint mt-1">{descricao.length}/200 caracteres</p>
        </div>

        <div>
          <Label className="text-sm font-medium text-tc-text-primary">
            O que o aluno vai aprender?<span className="text-rose-500">*</span>
          </Label>
          <p className="text-xs text-tc-text-hint mb-2">Adicione pelo menos 4 objetivos</p>
          <div className="space-y-2">
            {objetivos.map((obj, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={obj}
                  onChange={(e) => updateObjective(idx, e.target.value)}
                  placeholder={`Objetivo ${idx + 1}`}
                  className="flex-1"
                />
                {objetivos.length > 4 && (
                  <button
                    type="button"
                    onClick={() => removeObjective(idx)}
                    className="p-2 text-tc-text-hint hover:text-rose-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addObjective}
            className="mt-2 inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-medium"
          >
            <Plus className="h-4 w-4" />
            Adicionar objetivo
          </button>
        </div>

        <div>
          <Label className="text-sm font-medium text-tc-text-primary">Requisitos</Label>
          <div className="space-y-2 mt-2">
            {requisitos.map((req, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={req}
                  onChange={(e) => updateRequirement(idx, e.target.value)}
                  placeholder={`Requisito ${idx + 1}`}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeRequirement(idx)}
                  className="p-2 text-tc-text-hint hover:text-rose-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addRequirement}
            className="mt-2 inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-medium"
          >
            <Plus className="h-4 w-4" />
            Adicionar requisito
          </button>
        </div>

        <div>
          <Label className="text-sm font-medium text-tc-text-primary">
            Para quem é este curso?<span className="text-rose-500">*</span>
          </Label>
          <Textarea
            value={publicoAlvo}
            onChange={(e) => setPublicoAlvo(e.target.value)}
            placeholder="Descreva o público-alvo do seu curso..."
            className="mt-1 min-h-[80px]"
          />
        </div>
      </div>
    </div>
  );

  /* ================================================================ */
  /*  Render: Step 3 – Conteúdo do Curso                               */
  /* ================================================================ */

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-tc-text-primary">Estrutura do Curso</h2>
        <p className="text-sm text-tc-text-hint mt-1">
          Organize seu conteúdo em módulos e aulas
        </p>
      </div>

      <div className="space-y-6">
        {modules.map((mod, mIdx) => (
          <div key={mIdx} className="border border-border rounded-lg p-4 space-y-4">
            {/* Module header */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-semibold">
                {mIdx + 1}
              </div>
              <Input
                value={mod.title}
                onChange={(e) => updateModule(mIdx, { title: e.target.value })}
                placeholder={`Título do Módulo ${mIdx + 1}`}
                className="flex-1"
              />
              {modules.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeModule(mIdx)}
                  className="p-2 text-tc-text-hint hover:text-rose-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Lessons */}
            {mod.lessons.map((lesson, lIdx) => (
              <div
                key={lIdx}
                className="ml-11 border border-border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={lesson.title}
                    onChange={(e) =>
                      updateLesson(mIdx, lIdx, { title: e.target.value })
                    }
                    placeholder={`Título da Aula ${lIdx + 1}`}
                    className="flex-1"
                  />
                  {mod.lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLesson(mIdx, lIdx)}
                      className="p-2 text-tc-text-hint hover:text-rose-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <Input
                  value={lesson.description}
                  onChange={(e) =>
                    updateLesson(mIdx, lIdx, { description: e.target.value })
                  }
                  placeholder={`Descrição da Aula ${lIdx + 1}`}
                />

                <Select
                  value={lesson.type}
                  onValueChange={(v) => updateLesson(mIdx, lIdx, { type: v })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">🎥 Vídeo</SelectItem>
                    <SelectItem value="text">📄 Texto</SelectItem>
                    <SelectItem value="quiz">🎯 Quiz</SelectItem>
                  </SelectContent>
                </Select>

                {/* Video upload area */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:border-rose-300 transition-colors">
                  <Upload className="h-8 w-8 text-tc-text-hint mb-2" />
                  <span className="text-sm font-medium text-tc-text-primary">
                    {lesson.videoFile ? lesson.videoFile.name : "Upload do vídeo*"}
                  </span>
                  <span className="text-xs text-tc-text-hint mt-1">
                    MP4, MOV, AVI, MKV, WebM, FLV ou WMV (máx. 2GB)
                  </span>
                  <input
                    type="file"
                    accept=".mp4,.mov,.avi,.mkv,.webm,.flv,.wmv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      updateLesson(mIdx, lIdx, { videoFile: file });
                    }}
                  />
                </label>

                {/* Material upload area */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-rose-300 transition-colors">
                  <FileText className="h-6 w-6 text-tc-text-hint mb-1" />
                  <span className="text-sm font-medium text-tc-text-primary">
                    {lesson.materialFile
                      ? lesson.materialFile.name
                      : "Upload do material de apoio"}
                  </span>
                  <span className="text-xs text-tc-text-hint mt-1">
                    MP4, MOV ou AVI (máx. 2GB)
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      updateLesson(mIdx, lIdx, { materialFile: file });
                    }}
                  />
                </label>
              </div>
            ))}

            {/* Add lesson button */}
            <button
              type="button"
              onClick={() => addLesson(mIdx)}
              className="ml-11 inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-medium"
            >
              <Plus className="h-4 w-4" />
              Adicionar aula
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addModule}
        className="inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-medium"
      >
        <Plus className="h-4 w-4" />
        Adicionar módulo
      </button>
    </div>
  );

  /* ================================================================ */
  /*  Render: Step 4 – Quizzes e Avaliações                            */
  /* ================================================================ */

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-tc-text-primary">Quizzes e Avaliações</h2>
        <p className="text-sm text-tc-text-hint mt-1">
          Adicione avaliações para testar o conhecimento dos alunos
        </p>
      </div>

      {/* Info box */}
      <div className="bg-navy-500 text-white rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold">Sobre Quizzes e Provas:</p>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>
            Quizzes de Módulo: Avaliam o conhecimento de cada módulo (opcional, 1 por módulo)
          </li>
          <li>
            Prova Final: Avalia todo o conteúdo do curso (opcional, certificado depende dela)
          </li>
        </ul>
      </div>

      {/* Module quizzes */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold text-tc-text-primary">Quizzes de Módulo</h3>
          <p className="text-sm text-tc-text-hint mt-1">
            Adicione quizzes ao final de cada módulo para testar o aprendizado
          </p>
        </div>

        {modules.map((mod, mIdx) => {
          const quiz = moduleQuizzes[mIdx];
          if (!quiz) return null;

          return (
            <div key={mIdx} className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-semibold">
                    {mIdx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-tc-text-primary">
                      Módulo {mIdx + 1}
                    </p>
                    <p className="text-xs text-tc-text-hint">
                      {mod.lessons.length} aula{mod.lessons.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggleModuleQuiz(mIdx)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    quiz.enabled ? "bg-emerald-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      quiz.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {quiz.enabled && (
                <div className="space-y-4 pt-2">
                  {quiz.questions.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
                      <Input
                        value={q.question}
                        onChange={(e) =>
                          updateQuizQuestion(mIdx, qIdx, { question: e.target.value })
                        }
                        placeholder={`Pergunta ${qIdx + 1}`}
                      />
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => (
                          <label key={oIdx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`quiz-${mIdx}-${qIdx}`}
                              checked={q.correctIndex === oIdx}
                              onChange={() =>
                                updateQuizQuestion(mIdx, qIdx, { correctIndex: oIdx })
                              }
                              className="h-4 w-4 text-rose-500 border-gray-300"
                            />
                            <Input
                              value={opt}
                              onChange={(e) =>
                                updateQuizOption(mIdx, qIdx, oIdx, e.target.value)
                              }
                              placeholder={`Opção ${String.fromCharCode(65 + oIdx)}`}
                              className="flex-1"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addQuizQuestion(mIdx)}
                    className="inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar pergunta
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final exam */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-tc-text-primary">
              Prova Final do Curso
            </h3>
            <p className="text-sm text-tc-text-hint mt-1">
              Avalia todo o conteúdo do curso e é necessária para emitir o certificado
            </p>
          </div>
          <button
            type="button"
            onClick={toggleFinalExam}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              finalExam.enabled ? "bg-emerald-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                finalExam.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {finalExam.enabled && (
          <div className="border border-border rounded-lg p-4 space-y-4">
            {finalExam.questions.map((q, qIdx) => (
              <div key={qIdx} className="space-y-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
                <Input
                  value={q.question}
                  onChange={(e) =>
                    updateFinalQuestion(qIdx, { question: e.target.value })
                  }
                  placeholder={`Pergunta ${qIdx + 1}`}
                />
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <label key={oIdx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`final-${qIdx}`}
                        checked={q.correctIndex === oIdx}
                        onChange={() =>
                          updateFinalQuestion(qIdx, { correctIndex: oIdx })
                        }
                        className="h-4 w-4 text-rose-500 border-gray-300"
                      />
                      <Input
                        value={opt}
                        onChange={(e) =>
                          updateFinalOption(qIdx, oIdx, e.target.value)
                        }
                        placeholder={`Opção ${String.fromCharCode(65 + oIdx)}`}
                        className="flex-1"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addFinalQuestion}
              className="inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-medium"
            >
              <Plus className="h-4 w-4" />
              Adicionar pergunta
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /* ================================================================ */
  /*  Render: Step 5 – Materiais e Recursos                            */
  /* ================================================================ */

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-tc-text-primary">Materiais e Recursos</h2>
        <p className="text-sm text-tc-text-hint mt-1">
          Adicione a imagem de capa e materiais complementares
        </p>
      </div>

      {/* Cover image */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-tc-text-primary">
          Imagem de Capa<span className="text-rose-500">*</span>
        </Label>
        <p className="text-xs text-tc-text-hint">Dimensões recomendadas: 1280x720px (16:9)</p>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-10 cursor-pointer hover:border-rose-300 transition-colors">
          <Image className="h-10 w-10 text-tc-text-hint mb-3" />
          <span className="text-sm font-medium text-tc-text-primary">
            {coverImage ? coverImage.name : "Clique para fazer upload da imagem"}
          </span>
          <span className="text-xs text-tc-text-hint mt-1">PNG ou JPG (máx. 5MB)</span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setCoverImage(file);
            }}
          />
        </label>
      </div>

      {/* Support materials */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-tc-text-primary">Materiais de Apoio</Label>
        <p className="text-xs text-tc-text-hint">
          PDFs, planilhas, templates e outros materiais de apoio
        </p>
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-rose-300 transition-colors">
          <FileText className="h-8 w-8 text-tc-text-hint mb-2" />
          <span className="text-sm font-medium text-tc-text-primary">Adicionar recursos</span>
          <span className="text-xs text-tc-text-hint mt-1">
            PDF, DOC, XLS, ZIP (máx. 50MB cada)
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                setSupportMaterials((prev) => [...prev, ...Array.from(files)]);
              }
            }}
          />
        </label>

        {supportMaterials.length > 0 && (
          <div className="space-y-2 mt-2">
            {supportMaterials.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="text-sm text-tc-text-primary truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSupportMaterials((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="p-1 text-tc-text-hint hover:text-rose-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.zip";
            input.multiple = true;
            input.onchange = (e) => {
              const files = (e.target as HTMLInputElement).files;
              if (files) {
                setSupportMaterials((prev) => [...prev, ...Array.from(files)]);
              }
            };
            input.click();
          }}
          className="inline-flex items-center gap-1 text-sm text-rose-500 hover:text-rose-600 font-medium"
        >
          <Plus className="h-4 w-4" />
          Adicionar material
        </button>
      </div>
    </div>
  );

  /* ================================================================ */
  /*  Render: Step 6 – Precificação                                    */
  /* ================================================================ */

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-tc-text-primary">Precificação</h2>
        <p className="text-sm text-tc-text-hint mt-1">
          Defina como seu curso será oferecido
        </p>
      </div>

      <div className="space-y-3">
        {/* Free option */}
        <label
          className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
            pricingType === "free"
              ? "border-rose-500 bg-rose-50"
              : "border-border hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="pricing"
            checked={pricingType === "free"}
            onChange={() => setPricingType("free")}
            className="mt-1 h-4 w-4 text-rose-500 border-gray-300"
          />
          <div>
            <p className="text-sm font-medium text-tc-text-primary">Gratuito</p>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              Seu curso estará disponível gratuitamente para todos os viajantes
            </p>
          </div>
        </label>

        {/* Paid option */}
        <label
          className={`flex items-start gap-3 border rounded-lg p-4 cursor-pointer transition-colors ${
            pricingType === "paid"
              ? "border-rose-500 bg-rose-50"
              : "border-border hover:border-gray-300"
          }`}
        >
          <input
            type="radio"
            name="pricing"
            checked={pricingType === "paid"}
            onChange={() => setPricingType("paid")}
            className="mt-1 h-4 w-4 text-rose-500 border-gray-300"
          />
          <div>
            <p className="text-sm font-medium text-tc-text-primary">Pago</p>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              Defina um preço para seu curso
            </p>
          </div>
        </label>
      </div>

      {pricingType === "paid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-tc-text-primary">
              Moeda<span className="text-rose-500">*</span>
            </Label>
            <Select value={moeda} onValueChange={setMoeda}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">BR (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-tc-text-primary">
              Preço<span className="text-rose-500">*</span>
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder="0.00"
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Payment info box */}
      <div className="bg-navy-500 text-white rounded-lg p-4 space-y-2">
        <p className="text-sm font-semibold flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Sobre os pagamentos
        </p>
        <p className="text-sm leading-relaxed">
          A plataforma cobra uma taxa de 15% sobre as vendas. Você receberá os pagamentos
          mensalmente através da sua conta bancária cadastrada.
        </p>
      </div>
    </div>
  );

  /* ================================================================ */
  /*  Render: Step 7 – Sobre                                           */
  /* ================================================================ */

  const renderStep7 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-tc-text-primary">Sobre o Instrutor</h2>
        <p className="text-sm text-tc-text-hint mt-1">
          Conte sua história e mostre sua experiência
        </p>
      </div>

      {/* Instructor photo */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-tc-text-primary">Foto do Instrutor</Label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
            {instructorPhoto ? (
              <img
                src={URL.createObjectURL(instructorPhoto)}
                alt="Foto do instrutor"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-tc-text-hint" />
            )}
          </div>
          <label className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-tc-text-primary hover:bg-gray-50 cursor-pointer transition-colors">
            Upload de Foto
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setInstructorPhoto(file);
              }}
            />
          </label>
        </div>
      </div>

      {/* Biography */}
      <div>
        <Label className="text-sm font-medium text-tc-text-primary">
          Biografia<span className="text-rose-500">*</span>
        </Label>
        <p className="text-xs text-tc-text-hint mb-1">Mínimo de 100 caracteres</p>
        <Textarea
          value={biografia}
          onChange={(e) => setBiografia(e.target.value)}
          placeholder="Conte sua história, experiência e por que você é a pessoa certa para ensinar este curso..."
          className="mt-1 min-h-[120px]"
        />
        <p className="text-xs text-tc-text-hint mt-1">{biografia.length}/100 caracteres mínimos</p>
      </div>

      {/* Social media */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-tc-text-primary">
          Redes Sociais (Opcional)
        </Label>

        {/* LinkedIn */}
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            in
          </span>
          <Input
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/seu-perfil"
            className="flex-1"
          />
        </div>

        {/* Instagram */}
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
            IG
          </span>
          <Input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@seu_instagram"
            className="flex-1"
          />
        </div>

        {/* Website */}
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-500 text-white flex items-center justify-center">
            <Globe className="h-4 w-4" />
          </span>
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://seu-site.com"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );

  /* ================================================================ */
  /*  Step renderer                                                    */
  /* ================================================================ */

  const renderCurrentStep = () => {
    switch (step) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      case 3:
        return renderStep4();
      case 4:
        return renderStep5();
      case 5:
        return renderStep6();
      case 6:
        return renderStep7();
      default:
        return null;
    }
  };

  /* ================================================================ */
  /*  Main render                                                      */
  /* ================================================================ */

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/academy")}
          className="inline-flex items-center gap-2 text-sm text-tc-text-secondary hover:text-tc-text-primary transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <h1 className="text-xl font-bold text-tc-text-primary">Criar Novo Curso</h1>
        <p className="text-sm text-tc-text-hint mt-1">
          Compartilhe seu conhecimento com viajantes do mundo todo
        </p>
      </div>

      {/* Step indicator */}
      {renderStepIndicator()}

      {/* Current step content */}
      <div className="bg-white border border-border rounded-lg p-6">{renderCurrentStep()}</div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        {step === 0 ? (
          <button
            type="button"
            onClick={() => navigate("/academy")}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-tc-text-primary hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Cancelar
          </button>
        ) : (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg text-sm font-medium text-tc-text-primary hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </button>
        )}

        {step < 6 ? (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-500 hover:bg-navy-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Award className="h-4 w-4" />
            {isPublishing ? "Publicando..." : "Publicar Curso"}
          </button>
        )}
      </div>

      {/* Published modal */}
      <CoursePublishedModal
        open={showPublished}
        onClose={handleClosePublished}
        courseName={titulo || "Novo Curso"}
      />
    </div>
  );
}

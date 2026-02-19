import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Heart,
  DollarSign,
  Upload,
  CheckCircle2,
  Clock,
  Calendar,
  Wifi,
  UtensilsCrossed,
  WashingMachine,
  Car,
  Info,
} from "lucide-react";
import OpportunityPublishedModal from "@/components/modals/OpportunityPublishedModal";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_LABELS = ["Básico", "Trabalho", "Benefícios", "Finalização"];

const ACCOMMODATION_TYPES = [
  { emoji: "🚪", label: "Quarto Privado" },
  { emoji: "👥", label: "Quarto Compartilhado" },
  { emoji: "🛏️", label: "Dormitório" },
  { emoji: "⛺", label: "Camping / Barraca" },
  { emoji: "🏠", label: "Outro" },
];

const MEAL_OPTIONS = [
  "Café da Manhã",
  "Almoço",
  "Jantar",
  "Todas as Refeições",
];

const AMENITY_OPTIONS = [
  { icon: Wifi, label: "Café da Manhã" },
  { icon: UtensilsCrossed, label: "Cozinha" },
  { icon: WashingMachine, label: "Lavanderia" },
  { icon: Car, label: "Estacionamento" },
];

const DURATION_OPTIONS = [
  "1 semana",
  "2 semanas",
  "1 mês",
  "2 meses",
  "3 meses",
  "6 meses",
  "+6 meses",
];

const SKILL_OPTIONS = [
  "Atendimento ao Cliente",
  "Ensino de Inglês",
  "Cozinhar",
  "Limpeza",
  "Marketing Digital",
  "Fotografia",
  "Recepção",
  "Jardinagem",
  "Redes Sociais",
  "Comunicação",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toggleItem(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const CreateRequest = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPublishedModal, setShowPublishedModal] = useState(false);

  // Step 1: Básico
  const [title, setTitle] = useState("");
  const [opportunityType, setOpportunityType] = useState<"voluntariado" | "trabalho_pago" | "">("");
  const [description, setDescription] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);

  // Step 2: Trabalho
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [preferredStartDate, setPreferredStartDate] = useState("");
  const [flexibleStartDate, setFlexibleStartDate] = useState("");

  // Step 3: Benefícios
  const [accommodationType, setAccommodationType] = useState("");
  const [meals, setMeals] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);

  // Step 4: Finalização
  const [houseRules, setHouseRules] = useState("");

  // Navigation
  const totalSteps = 4;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;

  const goNext = () => {
    if (currentStep < totalSteps - 1) setCurrentStep((s) => s + 1);
  };
  const goBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: integrar com Supabase — inserir na tabela requests
      await new Promise((r) => setTimeout(r, 1000));
      setShowPublishedModal(true);
    } catch (error: any) {
      toast.error(error.message || "Erro ao publicar oportunidade");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextOrSubmit = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      goNext();
    }
  };

  // ---------------------------------------------------------------------------
  // Step Renderers
  // ---------------------------------------------------------------------------

  const renderBasico = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="opp-title">
          Título da Oportunidade<span className="text-rose-500">*</span>
        </Label>
        <Input
          id="opp-title"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          Tipo da Oportunidade<span className="text-rose-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setOpportunityType("voluntariado")}
            className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-colors ${
              opportunityType === "voluntariado"
                ? "border-rose-400 bg-rose-50"
                : "border-border bg-white hover:border-gray-300"
            }`}
          >
            <div className={`p-2 rounded-full ${opportunityType === "voluntariado" ? "bg-rose-100" : "bg-gray-100"}`}>
              <Heart className={`h-5 w-5 ${opportunityType === "voluntariado" ? "text-rose-500" : "text-gray-500"}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-tc-text-primary">Voluntariado</p>
              <p className="text-xs text-tc-text-hint">Trabalho voluntário sem remuneração</p>
            </div>
            {opportunityType === "voluntariado" && (
              <CheckCircle2 className="h-5 w-5 text-rose-500 ml-auto" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpportunityType("trabalho_pago")}
            className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-colors ${
              opportunityType === "trabalho_pago"
                ? "border-navy-500 bg-navy-50"
                : "border-border bg-white hover:border-gray-300"
            }`}
          >
            <div className={`p-2 rounded-full ${opportunityType === "trabalho_pago" ? "bg-navy-100" : "bg-gray-100"}`}>
              <DollarSign className={`h-5 w-5 ${opportunityType === "trabalho_pago" ? "text-navy-500" : "text-gray-500"}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-tc-text-primary">Trabalho Pago</p>
              <p className="text-xs text-tc-text-hint">Trabalho com remuneração</p>
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="opp-desc">
          Descrição Geral<span className="text-rose-500">*</span>
        </Label>
        <Textarea
          id="opp-desc"
          placeholder="Descreva a oportunidade, o ambiente de trabalho e o que o torna esta vaga especial..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-gray-50 min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opp-tasks">
          Descrição das Tarefas<span className="text-rose-500">*</span>
        </Label>
        <Textarea
          id="opp-tasks"
          placeholder="Liste as principais tarefas e responsabilidades do dia a dia..."
          value={taskDescription}
          onChange={(e) => setTaskDescription(e.target.value)}
          className="bg-gray-50 min-h-[100px]"
        />
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          Habilidades Requeridas<span className="text-rose-500">*</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => setRequiredSkills(toggleItem(requiredSkills, skill))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                requiredSkills.includes(skill)
                  ? "bg-navy-500 text-white"
                  : "bg-gray-100 text-tc-text-secondary hover:bg-gray-200"
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTrabalho = () => (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="opp-hours">
            Horas por Dia<span className="text-rose-500">*</span>
          </Label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
            <Input
              id="opp-hours"
              placeholder="Horas"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              className="bg-gray-50 pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="opp-days">
            Dias por Semana<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="opp-days"
            placeholder="Dias"
            value={daysPerWeek}
            onChange={(e) => setDaysPerWeek(e.target.value)}
            className="bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>
            Duração Mínima<span className="text-rose-500">*</span>
          </Label>
          <Select value={durationMin} onValueChange={setDurationMin}>
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>
            Duração Máxima<span className="text-rose-500">*</span>
          </Label>
          <Select value={durationMax} onValueChange={setDurationMax}>
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="opp-start-preferred">
          Data de Início Preferencial<span className="text-rose-500">*</span>
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <Input
            id="opp-start-preferred"
            type="date"
            value={preferredStartDate}
            onChange={(e) => setPreferredStartDate(e.target.value)}
            className="bg-gray-50 pl-9"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="opp-start-flexible">
          Data de Início Flexível<span className="text-rose-500">*</span>
        </Label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <Input
            id="opp-start-flexible"
            type="date"
            value={flexibleStartDate}
            onChange={(e) => setFlexibleStartDate(e.target.value)}
            className="bg-gray-50 pl-9"
          />
        </div>
      </div>
    </div>
  );

  const renderBeneficios = () => (
    <div className="space-y-5">
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Tipo de Acomodação<span className="text-rose-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {ACCOMMODATION_TYPES.map((acc) => (
            <button
              key={acc.label}
              type="button"
              onClick={() => setAccommodationType(acc.label)}
              className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-colors ${
                acc.label === "Outro" ? "col-span-1" : ""
              } ${
                accommodationType === acc.label
                  ? "border-navy-500 bg-navy-50"
                  : "border-border bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{acc.emoji}</span>
              <span className="text-sm font-medium text-tc-text-primary">{acc.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          Refeições Incluídas<span className="text-rose-500">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {MEAL_OPTIONS.map((meal) => (
            <button
              key={meal}
              type="button"
              onClick={() => setMeals(toggleItem(meals, meal))}
              className={`p-3 rounded-lg border text-sm font-medium text-left transition-colors ${
                meals.includes(meal)
                  ? "border-navy-500 bg-navy-50 text-tc-text-primary"
                  : "border-border bg-white text-tc-text-secondary hover:border-gray-300"
              }`}
            >
              {meal}
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          Amenidades Disponíveis<span className="text-rose-500">*</span>
        </Label>
        <div className="grid grid-cols-4 gap-3">
          {AMENITY_OPTIONS.map((amenity) => {
            const Icon = amenity.icon;
            const selected = amenities.includes(amenity.label);
            return (
              <button
                key={amenity.label}
                type="button"
                onClick={() => setAmenities(toggleItem(amenities, amenity.label))}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors ${
                  selected
                    ? "border-navy-500 bg-navy-50"
                    : "border-border bg-white hover:border-gray-300"
                }`}
              >
                <Icon className={`h-5 w-5 ${selected ? "text-navy-500" : "text-tc-text-hint"}`} />
                <span className="text-xs font-medium text-tc-text-primary text-center">{amenity.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderFinalizacao = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="opp-rules">
          Regras da Casa<span className="text-rose-500">*</span>
        </Label>
        <Textarea
          id="opp-rules"
          placeholder="Liste as regras importantes: horários, uso de áreas comuns, visitantes, álcool/fumo, etc..."
          value={houseRules}
          onChange={(e) => setHouseRules(e.target.value)}
          className="bg-gray-50 min-h-[100px]"
        />
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          Fotos do Local<span className="text-rose-500">*</span>{" "}
          <span className="text-sm font-normal text-tc-text-hint">(mínimo 3 fotos)</span>
        </Label>
        {/* TODO: integrar upload real via Supabase Storage */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gray-400 transition-colors bg-gray-50">
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-sm text-tc-text-secondary text-center">
            Clique para fazer upload ou arraste a imagem
          </span>
          <span className="text-xs text-tc-text-hint">PNG, JPG até 5MB</span>
        </div>
        <p className="text-xs text-tc-text-hint mt-2">
          Fotos adicionadas: 0 / Mínimo: 3
        </p>
      </div>

      {/* Antes de Publicar — rose info box */}
      <div className="flex gap-3 items-start border border-rose-200 rounded-lg p-4 bg-rose-50">
        <CheckCircle2 className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-tc-text-primary">
            Antes de Publicar
          </p>
          <p className="text-xs text-tc-text-secondary leading-relaxed mt-1">
            Revise todas as informações. Uma vez publicada, a oportunidade ficará visível para todos
            os viajantes da plataforma. Você poderá editar ou pausar a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderBasico();
      case 1: return renderTrabalho();
      case 2: return renderBeneficios();
      case 3: return renderFinalizacao();
      default: return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-tc-text-primary" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-tc-text-primary">
            Criar Nova Oportunidade
          </h1>
          <p className="text-sm text-tc-text-hint">
            Publique uma vaga e comece a receber candidatos
          </p>
        </div>
      </div>

      {/* Credit info banner */}
      <div className="flex items-start justify-between border border-rose-200 rounded-lg p-4 bg-rose-50">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-tc-text-primary">
              Sistema de Créditos
            </p>
            <ul className="text-xs text-tc-text-secondary leading-relaxed mt-1 space-y-0.5">
              <li>· Esta publicação consumirá 1 Host Credit do seu saldo</li>
              <li>· Sua vaga ficará <strong>ativa por 30 dias</strong></li>
              <li>· Para prorrogar por mais 30 dias, será necessário <strong>1 Host Credit adicional</strong></li>
              <li>· Vagas <strong>não renovadas serão encerradas</strong> automaticamente após 30 dias</li>
            </ul>
          </div>
        </div>
        <span className="shrink-0 px-3 py-1 text-xs font-medium rounded-full border border-rose-300 text-rose-600 bg-white">
          Saldo Atual: 5 créditos
        </span>
      </div>

      {/* Step indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-tc-text-primary">
            Etapa {currentStep + 1} de {totalSteps}
          </span>
          <span className="text-sm text-tc-text-hint">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />

        <div className="flex border-b border-border">
          {STEP_LABELS.map((label, index) => (
            <button
              key={label}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`flex-1 pb-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                index === currentStep
                  ? "border-navy-500 text-tc-text-primary"
                  : "border-transparent text-tc-text-hint"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {renderCurrentStep()}

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              type="button"
              onClick={currentStep > 0 ? goBack : () => navigate(-1)}
              className="py-3 px-6 rounded-lg border border-border text-tc-text-primary font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleNextOrSubmit}
              disabled={isSubmitting}
              className="py-3 px-6 rounded-lg font-medium text-white transition-colors disabled:opacity-50 bg-navy-500 hover:bg-navy-600 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                "Publicando..."
              ) : isLastStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Salvar e Publicar
                </>
              ) : (
                "Próximo"
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Published modal */}
      <OpportunityPublishedModal
        open={showPublishedModal}
        onClose={() => setShowPublishedModal(false)}
        onPrimaryAction={() => navigate("/anfitriao/oportunidades")}
      />
    </div>
  );
};

export default CreateRequest;

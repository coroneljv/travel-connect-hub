import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { AuthBackground } from "@/components/AuthBackground";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Info, CheckCircle2 } from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIAJANTE_STEP_LABELS = ["Pessoal", "Verificacao", "Habilidades", "Sobre Mim", "Viagens"];
const ANFITRIAO_STEP_LABELS = ["Organizacao", "Localizacao", "Informacoes", "Finalizacao"];

const LANGUAGES = [
  "Ingles",
  "Espanhol",
  "Alemao",
  "Portugues",
  "Frances",
  "Italiano",
  "Mandarim",
  "Japones",
  "Russo",
  "Arabe",
  "Holandes",
  "Coreano",
];

const SKILLS = [
  "Ensino de ingles",
  "Atendimento ao Cliente",
  "Cozinhar",
  "Limpeza",
  "Jardinagem",
  "Marketing Digital",
  "Construcao",
  "Fotografia",
  "Design",
  "Ensino",
  "Agricultura",
  "Cuidado de Animais",
  "Manutencao",
  "Recepcao",
  "Programacao",
  "Musica",
  "Arte",
  "Esporte",
  "Primeiros Socorros",
  "Outros",
];

const REGIONS = [
  "America do Norte",
  "America Central",
  "America do Sul",
  "Europa Central",
  "Europa Oriental",
  "Asia",
  "Oceania",
  "Africa",
  "Oriente Medio",
  "Caribe",
];

const DURATIONS = [
  "1-2 semanas",
  "3-4 semanas",
  "1-3 meses",
  "3-6 meses",
  "+6 meses",
  "Flexivel",
];

const HOST_TYPES = [
  { emoji: "\uD83E\uDD1D", label: "ONG / Org. sem fins lucrativos" },
  { emoji: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66", label: "Familia" },
  { emoji: "\uD83C\uDFE0", label: "Hostel / Albergue" },
  { emoji: "\uD83C\uDFE8", label: "Hotel / Pousada" },
  { emoji: "\uD83C\uDF3E", label: "Fazenda / Sitio" },
  { emoji: "\uD83C\uDF93", label: "Escola / Instituto" },
  { emoji: "\uD83C\uDFE2", label: "Empresa" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toggleChip(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function UploadArea({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div
      className={`border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 ${className}`}
    >
      <Upload className="w-8 h-8 text-gray-400" />
      <span className="text-sm text-gray-500 text-center">{label}</span>
    </div>
  );
}

function InfoBox({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "purple" }) {
  const base =
    variant === "purple"
      ? "bg-purple-50 border border-purple-200 text-purple-800"
      : "bg-blue-50 border border-blue-200 text-blue-800";
  return (
    <div className={`rounded-lg p-4 flex gap-3 items-start ${base}`}>
      <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        selected
          ? "bg-rose-500 text-white"
          : "bg-white border border-gray-300 text-navy-500 hover:border-gray-400"
      }`}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const Register = () => {
  const { signUp, selectedUIRole } = useAuth();
  const navigate = useNavigate();

  const isViajante = selectedUIRole === "viajante";
  const totalSteps = isViajante ? 5 : 4;
  const stepLabels = isViajante ? VIAJANTE_STEP_LABELS : ANFITRIAO_STEP_LABELS;

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");

  // Viajante: Pessoal (step 0)
  // (document upload, selfie upload are visual placeholders)

  // Viajante: Verificacao (step 1)
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [passportCountry, setPassportCountry] = useState("");

  // Viajante: Habilidades (step 2)
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Viajante: Sobre Mim (step 3)
  const [biography, setBiography] = useState("");
  const [travelStyle, setTravelStyle] = useState("");

  // Viajante: Viagens (step 4)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [additionalPreferences, setAdditionalPreferences] = useState("");

  // Anfitriao: Organizacao (step 0)
  const [orgName, setOrgName] = useState("");
  const [hostType, setHostType] = useState("");

  // Anfitriao: Localizacao (step 1)
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Anfitriao: Informacoes (step 2)
  const [cpf, setCpf] = useState("");
  const [familyMembers, setFamilyMembers] = useState("");

  // Anfitriao: Finalizacao (step 3)
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      if (!email || !fullName) {
        toast.error("Por favor preencha todos os campos obrigatorios.");
        setIsLoading(false);
        return;
      }

      const finalPassword = password || "temp123456";

      await signUp({
        email,
        password: finalPassword,
        fullName,
        uiRole: selectedUIRole!,
        phone: phone || undefined,
        orgName: isViajante ? undefined : orgName || undefined,
        orgCountry: isViajante ? undefined : country || undefined,
      });

      toast.success(
        isViajante
          ? "Cadastro finalizado com sucesso!"
          : "Perfil enviado para validacao! Nossa equipe revisara em ate 48 horas."
      );
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Falha no cadastro");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextOrSubmit = () => {
    if (isLastStep) {
      handleFinalSubmit();
    } else {
      goNext();
    }
  };

  // ---------------------------------------------------------------------------
  // Button label
  // ---------------------------------------------------------------------------

  const nextLabel = isLastStep
    ? isViajante
      ? "Finalizar"
      : "Enviar para Validacao"
    : "Proximo";

  // ---------------------------------------------------------------------------
  // Step Renderers: Viajante
  // ---------------------------------------------------------------------------

  const renderViajantePessoal = () => (
    <div className="space-y-5">
      <div>
        <Label className="text-base font-semibold mb-2 block">Documento de Identidade</Label>
        <UploadArea label="Clique ou arraste para enviar seu documento" />
      </div>

      <div>
        <Label className="text-base font-semibold mb-2 block">Selfie</Label>
        <UploadArea label="Clique ou arraste para enviar sua selfie" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">E-mail</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="e-mail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password">Senha</Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="******"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-phone">Telefone</Label>
        <Input
          id="reg-phone"
          type="tel"
          placeholder="+55 (00) 00000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <InfoBox>
        <strong>Por que verificacao?</strong> A verificacao de identidade protege tanto viajantes
        quanto anfitrioes, criando uma comunidade confiavel e segura.
      </InfoBox>
    </div>
  );

  const renderViajanteVerificacao = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="reg-fullname">Nome Completo</Label>
        <Input
          id="reg-fullname"
          placeholder="Seu nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-dob">Data de Nascimento</Label>
        <Input
          id="reg-dob"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-nationality">Nacionalidade</Label>
        <Input
          id="reg-nationality"
          placeholder="Ex: Brasileira"
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-passport">Pais do Passaporte</Label>
        <Input
          id="reg-passport"
          placeholder="Ex: Brasil"
          value={passportCountry}
          onChange={(e) => setPassportCountry(e.target.value)}
          className="bg-gray-50"
        />
      </div>
    </div>
  );

  const renderViajanteHabilidades = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">Idiomas</Label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <Chip
              key={lang}
              label={lang}
              selected={selectedLanguages.includes(lang)}
              onClick={() => setSelectedLanguages(toggleChip(selectedLanguages, lang))}
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">Habilidades</Label>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <Chip
              key={skill}
              label={skill}
              selected={selectedSkills.includes(skill)}
              onClick={() => setSelectedSkills(toggleChip(selectedSkills, skill))}
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-2 block">Curriculo</Label>
        <UploadArea label="Clique ou arraste para enviar seu curriculo (PDF)" />
      </div>
    </div>
  );

  const renderViajanteSobreMim = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="reg-bio">Mini Biografia</Label>
        <Textarea
          id="reg-bio"
          placeholder="Conte um pouco sobre voce, suas experiencias e o que te motiva a viajar..."
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          className="bg-gray-50 min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-travel-style">Estilo de Viagem</Label>
        <Input
          id="reg-travel-style"
          placeholder="Ex: Mochileiro, Voluntario, Nomade Digital..."
          value={travelStyle}
          onChange={(e) => setTravelStyle(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          Fotos de Perfil <span className="text-sm font-normal text-gray-500">(min 2, max 6)</span>
        </Label>
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      <InfoBox variant="purple">
        <strong>Destaque seu perfil</strong> - Uma boa biografia e fotos autenticas fazem toda a
        diferenca!
      </InfoBox>
    </div>
  );

  const renderViajanteViagens = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">Regioes de Interesse</Label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <Chip
              key={region}
              label={region}
              selected={selectedRegions.includes(region)}
              onClick={() => setSelectedRegions(toggleChip(selectedRegions, region))}
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">Duracao Preferida</Label>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((dur) => (
            <Chip
              key={dur}
              label={dur}
              selected={selectedDurations.includes(dur)}
              onClick={() => setSelectedDurations(toggleChip(selectedDurations, dur))}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-prefs">Preferencias Adicionais</Label>
        <Textarea
          id="reg-prefs"
          placeholder="Alguma preferencia ou necessidade especial que devemos saber?"
          value={additionalPreferences}
          onChange={(e) => setAdditionalPreferences(e.target.value)}
          className="bg-gray-50 min-h-[100px]"
        />
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Step Renderers: Anfitriao
  // ---------------------------------------------------------------------------

  const renderAnfitriaoOrganizacao = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="reg-orgname">Nome da Organizacao</Label>
        <Input
          id="reg-orgname"
          placeholder="Nome do seu espaco ou organizacao"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">Tipo de Anfitriao</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HOST_TYPES.map((ht) => (
            <button
              key={ht.label}
              type="button"
              onClick={() => setHostType(ht.label)}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-colors ${
                hostType === ht.label
                  ? "border-rose-500 bg-rose-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{ht.emoji}</span>
              <span className="text-sm font-medium text-navy-500">{ht.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnfitriaoLocalizacao = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="reg-address">Endereco</Label>
        <Input
          id="reg-address"
          placeholder="Rua, numero, complemento"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-city">Cidade</Label>
          <Input
            id="reg-city"
            placeholder="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-state">Estado</Label>
          <Input
            id="reg-state"
            placeholder="Estado"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-country">Pais</Label>
          <Input
            id="reg-country"
            placeholder="Pais"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-postal">CEP</Label>
          <Input
            id="reg-postal"
            placeholder="00000-000"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="bg-gray-50"
          />
        </div>
      </div>
    </div>
  );

  const renderAnfitriaoInformacoes = () => (
    <div className="space-y-5">
      <InfoBox>
        Nosso sistema utiliza verificacao com inteligencia artificial para garantir a autenticidade
        dos documentos enviados e a seguranca da plataforma.
      </InfoBox>

      <div className="space-y-2">
        <Label htmlFor="reg-email-host">E-mail</Label>
        <Input
          id="reg-email-host"
          type="email"
          placeholder="e-mail@exemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password-host">Senha</Label>
        <Input
          id="reg-password-host"
          type="password"
          placeholder="******"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-fullname-host">Nome Completo</Label>
        <Input
          id="reg-fullname-host"
          placeholder="Seu nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-cpf">CPF</Label>
        <Input
          id="reg-cpf"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      {hostType === "Familia" && (
        <div className="space-y-2">
          <Label htmlFor="reg-family">Numero de Membros da Familia</Label>
          <Select value={familyMembers} onValueChange={setFamilyMembers}>
            <SelectTrigger className="bg-gray-50">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {["1", "2", "3", "4", "5", "6", "7", "8+"].map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-3">
        <Label className="text-base font-semibold block">Documentos</Label>
        <UploadArea label="Documento de Identidade" />
        <UploadArea label="Comprovante de Residencia" />
        <UploadArea label="Selfie com Documento" />
      </div>
    </div>
  );

  const renderAnfitriaoFinalizacao = () => (
    <div className="space-y-5">
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Fotos do Espaco <span className="text-sm font-normal text-gray-500">(minimo 3)</span>
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <UploadArea key={i} label={i < 3 ? `Foto ${i + 1} *` : `Foto ${i + 1}`} className="min-h-[100px]" />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="declaration"
            checked={declarationAccepted}
            onCheckedChange={(checked) => setDeclarationAccepted(checked === true)}
          />
          <label htmlFor="declaration" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
            Declaro que todas as informacoes fornecidas sao verdadeiras e que estou ciente de que
            informacoes falsas podem resultar na remocao do meu perfil da plataforma.
          </label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          />
          <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
            Li e aceito os{" "}
            <Link to="#" className="text-rose-500 hover:underline">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link to="#" className="text-rose-500 hover:underline">
              Politica de Privacidade
            </Link>{" "}
            da plataforma Travel Connect.
          </label>
        </div>
      </div>

      <InfoBox>
        <strong>Proximos Passos</strong> - Apos enviar seu perfil, nossa equipe ira revisar as
        informacoes em ate 48 horas.
      </InfoBox>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Step Router
  // ---------------------------------------------------------------------------

  const renderCurrentStep = () => {
    if (isViajante) {
      switch (currentStep) {
        case 0:
          return renderViajantePessoal();
        case 1:
          return renderViajanteVerificacao();
        case 2:
          return renderViajanteHabilidades();
        case 3:
          return renderViajanteSobreMim();
        case 4:
          return renderViajanteViagens();
        default:
          return null;
      }
    } else {
      switch (currentStep) {
        case 0:
          return renderAnfitriaoOrganizacao();
        case 1:
          return renderAnfitriaoLocalizacao();
        case 2:
          return renderAnfitriaoInformacoes();
        case 3:
          return renderAnfitriaoFinalizacao();
        default:
          return null;
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <AuthBackground variant="split">
      <div className="w-full max-w-lg space-y-6 py-4">
        {/* Mobile logo */}
        <div className="flex justify-center lg:hidden">
          <Logo size="md" />
        </div>

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-navy-500">
            Cadastro de {isViajante ? "Viajante" : "Anfitriao"}
          </h1>
          <p className="text-muted-foreground text-sm">
            Preencha as informacoes para criar seu perfil na plataforma.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-navy-500">
              Etapa {currentStep + 1} de {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />

          {/* Clickable step tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {stepLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  index === currentStep
                    ? "bg-navy-500 text-white"
                    : index < currentStep
                    ? "bg-navy-100 text-navy-500"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {index < currentStep && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Step content card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-navy-500">{stepLabels[currentStep]}</CardTitle>
            <CardDescription>
              {isViajante
                ? [
                    "Envie seus documentos e informacoes de contato",
                    "Preencha suas informacoes pessoais",
                    "Selecione seus idiomas e habilidades",
                    "Conte-nos mais sobre voce",
                    "Defina suas preferencias de viagem",
                  ][currentStep]
                : [
                    "Informacoes sobre sua organizacao",
                    "Endereco do seu espaco",
                    "Dados pessoais e documentacao",
                    "Fotos e confirmacao final",
                  ][currentStep]}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderCurrentStep()}</CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex gap-4">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="flex-1 py-3 px-6 rounded-lg border-2 border-navy-500 text-navy-500 font-medium hover:bg-navy-50 transition-colors"
            >
              Voltar
            </button>
          )}
          <button
            type="button"
            onClick={handleNextOrSubmit}
            disabled={isLoading || (isLastStep && !isViajante && (!declarationAccepted || !termsAccepted))}
            className={`flex-1 py-3 px-6 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${
              currentStep === 0 ? "w-full" : ""
            } bg-navy-500 hover:bg-navy-600`}
          >
            {isLoading ? "Enviando..." : nextLabel}
          </button>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground pb-4">
          Ja possui conta?{" "}
          <Link to="/login" className="text-rose-500 hover:underline font-medium">
            Faca login
          </Link>
        </p>
      </div>
    </AuthBackground>
  );
};

export default Register;

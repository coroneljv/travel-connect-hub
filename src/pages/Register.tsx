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
import { Upload, Info, CheckCircle2, MapPin, Building2, X } from "lucide-react";
import HostTypeFamilyForm from "@/components/shared/HostTypeFamilyForm";
import type { HostSignupStep3FamilyData } from "@/components/shared/HostTypeFamilyForm";
import HostTypeOngForm from "@/components/shared/HostTypeOngForm";
import type { HostSignupStep3OngData } from "@/components/shared/HostTypeOngForm";
import HostTypeHostelForm from "@/components/shared/HostTypeHostelForm";
import type { HostSignupStep3HostelData } from "@/components/shared/HostTypeHostelForm";
import HostTypeHotelForm from "@/components/shared/HostTypeHotelForm";
import type { HostSignupStep3HotelData } from "@/components/shared/HostTypeHotelForm";
import HostTypeFarmForm from "@/components/shared/HostTypeFarmForm";
import type { HostSignupStep3FarmData } from "@/components/shared/HostTypeFarmForm";
import HostTypeSchoolForm from "@/components/shared/HostTypeSchoolForm";
import type { HostSignupStep3SchoolData } from "@/components/shared/HostTypeSchoolForm";
import HostTypeCompanyForm from "@/components/shared/HostTypeCompanyForm";
import type { HostSignupStep3CompanyData } from "@/components/shared/HostTypeCompanyForm";
import HostSignupApprovedModal from "@/components/modals/HostSignupApprovedModal";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIAJANTE_STEP_LABELS = ["Pessoal", "Verificacao", "Habilidades", "Sobre Mim", "Viagens"];
const ANFITRIAO_STEP_LABELS = ["Organização", "Localização", "Informações", "Finalização"];

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
  { emoji: "🤝", label: "ONG / Org. sem fins lucrativos" },
  { emoji: "👨‍👩‍👧‍👦", label: "Família" },
  { emoji: "🏠", label: "Hostel / Albergue" },
  { emoji: "🏨", label: "Hotel / Pousada" },
  { emoji: "🌾", label: "Fazenda / Sítio" },
  { emoji: "🎓", label: "Escola / Instituto" },
  { emoji: "🏢", label: "Empresa" },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Localização step (Etapa 2 de 4) — TODO: usar ao integrar Supabase */
export interface HostSignupStep1Data {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

/** Organização step (Etapa 1 de 4) — TODO: usar ao integrar Supabase */
export interface HostSignupStep2Data {
  orgName: string;
  hostType: string;
}

export type { HostSignupStep3FamilyData };
export type { HostSignupStep3OngData };
export type { HostSignupStep3HostelData };
export type { HostSignupStep3HotelData };
export type { HostSignupStep3FarmData };
export type { HostSignupStep3SchoolData };
export type { HostSignupStep3CompanyData };

/** Finalização step (Etapa 4 de 4) — TODO: usar ao integrar Supabase */
export interface HostSignupStep4Data {
  /** TODO: substituir por File[] quando integrar Supabase Storage */
  photoCount: number;
  declarationAccepted: boolean;
  termsAccepted: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toggleChip(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
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

  // Anfitriao: Informacoes (step 2) — shared
  const [cpf, setCpf] = useState("");
  // Anfitriao: Informacoes — Família
  const [familyMembers, setFamilyMembers] = useState("");
  // Anfitriao: Informacoes — ONG
  const [cnpj, setCnpj] = useState("");
  const [foundationYear, setFoundationYear] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  // Anfitriao: Informacoes — Hostel / Hotel
  const [cadastur, setCadastur] = useState("");
  const [roomCount, setRoomCount] = useState("");
  const [totalCapacity, setTotalCapacity] = useState("");
  // Anfitriao: Informacoes — Fazenda
  const [car, setCar] = useState("");
  const [propertySize, setPropertySize] = useState("");
  // Anfitriao: Informacoes — Escola
  const [mecCode, setMecCode] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  // Anfitriao: Informacoes — Empresa
  const [companySize, setCompanySize] = useState("");

  // Anfitriao: Finalizacao (step 3)
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // File uploads: Viajante
  const [docIdentidade, setDocIdentidade] = useState<File | null>(null);
  const [selfieDoc, setSelfieDoc] = useState<File | null>(null);
  const [curriculo, setCurriculo] = useState<File | null>(null);
  const [profilePhotos, setProfilePhotos] = useState<(File | null)[]>([null, null, null, null, null, null]);
  const [profilePhotoPreviews, setProfilePhotoPreviews] = useState<(string | null)[]>([null, null, null, null, null, null]);

  // File uploads: Anfitriao
  const [hostPhotos, setHostPhotos] = useState<File[]>([]);
  const [hostPhotoPreviews, setHostPhotoPreviews] = useState<string[]>([]);

  // Anfitriao: Modal aprovação
  const [showApprovedModal, setShowApprovedModal] = useState(false);

  // ---------------------------------------------------------------------------
  // File-upload helpers
  // ---------------------------------------------------------------------------

  const handleProfilePhotoChange = (index: number, file: File | null) => {
    if (!file) return;
    const newPhotos = [...profilePhotos];
    newPhotos[index] = file;
    setProfilePhotos(newPhotos);

    const reader = new FileReader();
    reader.onload = (e) => {
      const newPreviews = [...profilePhotoPreviews];
      newPreviews[index] = e.target?.result as string;
      setProfilePhotoPreviews(newPreviews);
    };
    reader.readAsDataURL(file);
  };

  const handleHostPhotoAdd = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setHostPhotos((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setHostPhotoPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeHostPhoto = (index: number) => {
    setHostPhotos((prev) => prev.filter((_, i) => i !== index));
    setHostPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

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
      if (isViajante) {
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
        });
        toast.success("Cadastro finalizado com sucesso!");
        navigate("/dashboard");
      } else {
        // TODO: integrar criação de conta Supabase para Anfitrião
        // Simula envio + abre modal de aprovação
        await new Promise((r) => setTimeout(r, 1000));
        setShowApprovedModal(true);
      }
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
      : "Enviar para Validação"
    : "Próximo";

  // ---------------------------------------------------------------------------
  // Step Renderers: Viajante
  // ---------------------------------------------------------------------------

  const renderViajantePessoal = () => (
    <div className="space-y-5">
      <div>
        <Label className="text-base font-semibold mb-2 block">Documento de Identidade</Label>
        <label className="cursor-pointer block">
          <input
            type="file"
            className="hidden"
            accept="application/pdf,image/*"
            onChange={(e) => setDocIdentidade(e.target.files?.[0] ?? null)}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors bg-gray-50">
            {docIdentidade ? (
              <span className="text-sm text-green-600 font-medium">{docIdentidade.name}</span>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500 text-center">Clique ou arraste para enviar seu documento</span>
              </>
            )}
          </div>
        </label>
      </div>

      <div>
        <Label className="text-base font-semibold mb-2 block">Selfie</Label>
        <label className="cursor-pointer block">
          <input
            type="file"
            className="hidden"
            accept="image/png,image/jpeg"
            onChange={(e) => setSelfieDoc(e.target.files?.[0] ?? null)}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors bg-gray-50">
            {selfieDoc ? (
              <span className="text-sm text-green-600 font-medium">{selfieDoc.name}</span>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500 text-center">Clique ou arraste para enviar sua selfie</span>
              </>
            )}
          </div>
        </label>
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
        <label className="cursor-pointer block">
          <input
            type="file"
            className="hidden"
            accept="application/pdf"
            onChange={(e) => setCurriculo(e.target.files?.[0] ?? null)}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors bg-gray-50">
            {curriculo ? (
              <span className="text-sm text-green-600 font-medium">{curriculo.name}</span>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500 text-center">Clique ou arraste para enviar seu curriculo (PDF)</span>
              </>
            )}
          </div>
        </label>
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
            <label key={i} className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept="image/png,image/jpeg"
                onChange={(e) => handleProfilePhotoChange(i, e.target.files?.[0] ?? null)}
              />
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:border-gray-400 transition-colors overflow-hidden">
                {profilePhotoPreviews[i] ? (
                  <img src={profilePhotoPreviews[i]!} alt="" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <Upload className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </label>
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
        <Label htmlFor="reg-orgname">Nome da Organização</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <Input
            id="reg-orgname"
            placeholder="Ex: Green Paradise Eco Lodge"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="bg-gray-50 pl-9"
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          Tipo de Anfitrião<span className="text-rose-500"> *</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HOST_TYPES.map((ht) => (
            <button
              key={ht.label}
              type="button"
              onClick={() => setHostType(ht.label)}
              className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-colors ${
                ht.label === "Empresa" ? "sm:col-span-2" : ""
              } ${
                hostType === ht.label
                  ? "border-navy-500 bg-navy-50"
                  : "border-border bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{ht.emoji}</span>
              <span className="text-sm font-medium text-tc-text-primary">{ht.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );

  const renderAnfitriaoLocalizacao = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="reg-address">
          Endereço<span className="text-rose-500">*</span>
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <Input
            id="reg-address"
            placeholder="Rua, número, complemento"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-gray-50 pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-city">
            Cidade<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-city"
            placeholder="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-state">
            Estado<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-state"
            placeholder="Estado / Província"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-country">
            País<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-country"
            placeholder="País"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-postal">
            Código Postal<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-postal"
            placeholder="Código"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="bg-gray-50"
          />
        </div>
      </div>
    </div>
  );

  const renderAnfitriaoInformacoes = () => {
    if (hostType === "Família") {
      return (
        <HostTypeFamilyForm
          value={{ cpf, familyMembers }}
          onChange={(data) => {
            setCpf(data.cpf);
            setFamilyMembers(data.familyMembers);
          }}
        />
      );
    }
    if (hostType === "ONG / Org. sem fins lucrativos") {
      return (
        <HostTypeOngForm
          value={{ cnpj, foundationYear, registrationNumber }}
          onChange={(data) => {
            setCnpj(data.cnpj);
            setFoundationYear(data.foundationYear);
            setRegistrationNumber(data.registrationNumber);
          }}
        />
      );
    }
    if (hostType === "Hostel / Albergue") {
      return (
        <HostTypeHostelForm
          value={{ cnpj, cadastur, roomCount, totalCapacity }}
          onChange={(data) => {
            setCnpj(data.cnpj);
            setCadastur(data.cadastur);
            setRoomCount(data.roomCount);
            setTotalCapacity(data.totalCapacity);
          }}
        />
      );
    }
    if (hostType === "Hotel / Pousada") {
      return (
        <HostTypeHotelForm
          value={{ cnpj, cadastur, roomCount, totalCapacity }}
          onChange={(data) => {
            setCnpj(data.cnpj);
            setCadastur(data.cadastur);
            setRoomCount(data.roomCount);
            setTotalCapacity(data.totalCapacity);
          }}
        />
      );
    }
    if (hostType === "Fazenda / Sítio") {
      return (
        <HostTypeFarmForm
          value={{ cnpj, car, propertySize }}
          onChange={(data) => {
            setCnpj(data.cnpj);
            setCar(data.car);
            setPropertySize(data.propertySize);
          }}
        />
      );
    }
    if (hostType === "Escola / Instituto") {
      return (
        <HostTypeSchoolForm
          value={{ cnpj, mecCode, educationLevel }}
          onChange={(data) => {
            setCnpj(data.cnpj);
            setMecCode(data.mecCode);
            setEducationLevel(data.educationLevel);
          }}
        />
      );
    }
    if (hostType === "Empresa") {
      return (
        <HostTypeCompanyForm
          value={{ cnpj, foundationYear, companySize }}
          onChange={(data) => {
            setCnpj(data.cnpj);
            setFoundationYear(data.foundationYear);
            setCompanySize(data.companySize);
          }}
        />
      );
    }
    // Fallback: nenhum tipo selecionado ainda
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <Info className="h-8 w-8 text-tc-text-hint" />
        <p className="text-sm text-tc-text-secondary text-center">
          Selecione um tipo de anfitrião na etapa <strong>Organização</strong> para preencher as informações específicas.
        </p>
        <button
          type="button"
          onClick={() => setCurrentStep(0)}
          className="text-sm text-navy-500 font-medium hover:underline"
        >
          Ir para Organização
        </button>
      </div>
    );
  };

  const renderAnfitriaoFinalizacao = () => (
    <div className="space-y-5">
      {/* Photo upload */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          Fotos do Local<span className="text-rose-500">*</span>{" "}
          <span className="text-sm font-normal text-tc-text-hint">(mínimo 3 fotos)</span>
        </Label>
        <label className="cursor-pointer block">
          <input
            type="file"
            className="hidden"
            accept="image/png,image/jpeg"
            multiple
            onChange={(e) => handleHostPhotoAdd(e.target.files)}
          />
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition-colors bg-gray-50">
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-tc-text-secondary text-center">
              Clique para fazer upload ou arraste a imagem
            </span>
            <span className="text-xs text-tc-text-hint">PNG, JPG até 5MB</span>
          </div>
        </label>
        {hostPhotoPreviews.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {hostPhotoPreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeHostPhoto(i)}
                  className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-tc-text-hint mt-2">
          Fotos adicionadas {hostPhotos.length} / Mínimo 3
        </p>
      </div>

      {/* Declaração de Veracidade — bordered card */}
      <div className="border border-border rounded-lg p-4 space-y-2">
        <div className="flex items-start gap-3">
          <Checkbox
            id="declaration"
            checked={declarationAccepted}
            onCheckedChange={(checked) => setDeclarationAccepted(checked === true)}
            className="mt-0.5"
          />
          <div>
            <label
              htmlFor="declaration"
              className="text-sm font-semibold text-tc-text-primary cursor-pointer"
            >
              Declaração de Veracidade<span className="text-rose-500"> *</span>
            </label>
            <p className="text-xs text-tc-text-secondary leading-relaxed mt-1">
              Declaro que todas as informações fornecidas são verdadeiras e que sou
              responsável legal pela organização. Compreendo que informações falsas
              podem resultar no cancelamento da conta.
            </p>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          className="mt-0.5"
        />
        <label htmlFor="terms" className="text-sm text-tc-text-secondary leading-relaxed cursor-pointer">
          Li e aceito os{" "}
          <Link to="#" className="text-rose-500 font-semibold hover:underline">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link to="#" className="text-rose-500 font-semibold hover:underline">
            Política de Privacidade da Plataforma
          </Link>
          <span className="text-rose-500">*</span>
        </label>
      </div>

      {/* Próximos Passos — rose info box */}
      <div className="flex gap-3 items-start border border-rose-200 rounded-lg p-4 bg-rose-50">
        <CheckCircle2 className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-tc-text-primary">
            Próximos Passos
          </p>
          <p className="text-xs text-tc-text-secondary leading-relaxed mt-1">
            Após enviar seu perfil, nossa equipe irá revisar as informações em até 48
            horas. Você receberá um e-mail quando seu perfil for aprovado e poderá
            começar a publicar oportunidades.
          </p>
        </div>
      </div>
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

        {/* Header — only for Viajante; Anfitrião card has its own header */}
        {isViajante && (
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-navy-500">
              Cadastro de Viajante
            </h1>
            <p className="text-muted-foreground text-sm">
              Preencha as informacoes para criar seu perfil na plataforma.
            </p>
          </div>
        )}

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
          <div
            className={`flex overflow-x-auto ${
              !isViajante ? "border-b border-border gap-0" : "gap-1 pb-1"
            }`}
          >
            {stepLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={
                  !isViajante
                    ? `flex-1 pb-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                        index === currentStep
                          ? "border-navy-500 text-tc-text-primary"
                          : "border-transparent text-tc-text-hint"
                      }`
                    : `px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                        index === currentStep
                          ? "bg-navy-500 text-white"
                          : index < currentStep
                          ? "bg-navy-100 text-navy-500"
                          : "bg-gray-100 text-gray-400"
                      }`
                }
              >
                {isViajante && index < currentStep && (
                  <CheckCircle2 className="w-3 h-3 inline mr-1" />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Step content card */}
        <Card className={isViajante ? "border-0 shadow-lg" : ""}>
          <CardHeader className={`pb-2 ${!isViajante ? "text-center" : ""}`}>
            <CardTitle className="text-lg text-navy-500">
              {isViajante ? stepLabels[currentStep] : "Anfitrião"}
            </CardTitle>
            <CardDescription>
              {isViajante
                ? [
                    "Envie seus documentos e informacoes de contato",
                    "Preencha suas informacoes pessoais",
                    "Selecione seus idiomas e habilidades",
                    "Conte-nos mais sobre voce",
                    "Defina suas preferencias de viagem",
                  ][currentStep]
                : "Complete seu perfil para começar a receber viajantes"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}

            {/* Anfitrião: buttons inside card */}
            {!isViajante && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  type="button"
                  onClick={currentStep > 0 ? goBack : () => navigate("/login")}
                  className="py-3 px-6 rounded-lg border border-border text-tc-text-primary font-medium hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleNextOrSubmit}
                  disabled={isLoading || (isLastStep && (!declarationAccepted || !termsAccepted))}
                  className="py-3 px-6 rounded-lg font-medium text-white transition-colors disabled:opacity-50 bg-navy-500 hover:bg-navy-600 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    "Enviando..."
                  ) : (
                    <>
                      {isLastStep && <CheckCircle2 className="w-4 h-4" />}
                      {nextLabel}
                    </>
                  )}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Viajante: buttons outside card */}
        {isViajante && (
          <div className={`grid gap-4 ${currentStep > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="py-3 px-6 rounded-lg border border-border text-tc-text-primary font-medium hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            )}
            <button
              type="button"
              onClick={handleNextOrSubmit}
              disabled={isLoading}
              className="py-3 px-6 rounded-lg font-medium text-white transition-colors disabled:opacity-50 bg-navy-500 hover:bg-navy-600"
            >
              {isLoading ? "Enviando..." : nextLabel}
            </button>
          </div>
        )}

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground pb-4">
          Já possui conta?{" "}
          <Link to="/login" className="text-rose-500 hover:underline font-medium">
            Login
          </Link>
        </p>
      </div>

      {/* Modal: Cadastro aprovado (Anfitrião) */}
      <HostSignupApprovedModal
        open={showApprovedModal}
        onClose={() => setShowApprovedModal(false)}
        onPrimaryAction={() => navigate("/login")}
      />
    </AuthBackground>
  );
};

export default Register;

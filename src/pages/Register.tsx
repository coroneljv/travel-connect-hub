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
import { useTranslation } from "react-i18next";

// ---------------------------------------------------------------------------
// Constants (pt-BR values — stored to DB, do not translate)
// ---------------------------------------------------------------------------

const LANGUAGES = [
  "Inglês",
  "Espanhol",
  "Alemão",
  "Português",
  "Francês",
  "Italiano",
  "Mandarim",
  "Japonês",
  "Russo",
  "Árabe",
  "Holandês",
  "Coreano",
];

const SKILLS = [
  "Ensino de inglês",
  "Atendimento ao Cliente",
  "Cozinhar",
  "Limpeza",
  "Jardinagem",
  "Marketing Digital",
  "Construção",
  "Fotografia",
  "Design",
  "Ensino",
  "Agricultura",
  "Cuidado de Animais",
  "Manutenção",
  "Recepção",
  "Programação",
  "Música",
  "Arte",
  "Esporte",
  "Primeiros Socorros",
  "Outros",
];

const REGIONS = [
  "América do Norte",
  "América Central",
  "América do Sul",
  "Europa Central",
  "Europa Oriental",
  "Ásia",
  "Oceania",
  "África",
  "Oriente Médio",
  "Caribe",
];

const DURATIONS = [
  "1-2 semanas",
  "3-4 semanas",
  "1-3 meses",
  "3-6 meses",
  "+6 meses",
  "Flexível",
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
  const { t } = useTranslation();
  const { signUp, selectedUIRole } = useAuth();
  const navigate = useNavigate();

  const isViajante = selectedUIRole === "viajante";
  const totalSteps = isViajante ? 5 : 4;

  // Step labels (computed inside component for i18n)
  const VIAJANTE_STEP_LABELS = [
    t("auth.register.steps.personal"),
    t("auth.register.steps.verification"),
    t("auth.register.steps.skills"),
    t("auth.register.steps.about"),
    t("auth.register.steps.travel"),
  ];
  const ANFITRIAO_STEP_LABELS = [
    t("auth.register.steps.organization"),
    t("auth.register.steps.location"),
    t("auth.register.steps.information"),
    t("auth.register.steps.completion"),
  ];

  const stepLabels = isViajante ? VIAJANTE_STEP_LABELS : ANFITRIAO_STEP_LABELS;

  // Display label maps (DB values → translated display)
  const LANGUAGE_LABELS: Record<string, string> = {
    "Inglês": t("lists.languages.english"),
    "Espanhol": t("lists.languages.spanish"),
    "Alemão": t("lists.languages.german"),
    "Português": t("lists.languages.portuguese"),
    "Francês": t("lists.languages.french"),
    "Italiano": t("lists.languages.italian"),
    "Mandarim": t("lists.languages.mandarin"),
    "Japonês": t("lists.languages.japanese"),
    "Russo": t("lists.languages.russian"),
    "Árabe": t("lists.languages.arabic"),
    "Holandês": t("lists.languages.dutch"),
    "Coreano": t("lists.languages.korean"),
  };

  const SKILL_LABELS: Record<string, string> = {
    "Ensino de inglês": t("lists.skills.englishTeaching"),
    "Atendimento ao Cliente": t("lists.skills.customerService"),
    "Cozinhar": t("lists.skills.cooking"),
    "Limpeza": t("lists.skills.cleaning"),
    "Jardinagem": t("lists.skills.gardening"),
    "Marketing Digital": t("lists.skills.digitalMarketing"),
    "Construção": t("lists.skills.construction"),
    "Fotografia": t("lists.skills.photography"),
    "Design": t("lists.skills.design"),
    "Ensino": t("lists.skills.teaching"),
    "Agricultura": t("lists.skills.agriculture"),
    "Cuidado de Animais": t("lists.skills.animalCare"),
    "Manutenção": t("lists.skills.maintenance"),
    "Recepção": t("lists.skills.reception"),
    "Programação": t("lists.skills.programming"),
    "Música": t("lists.skills.music"),
    "Arte": t("lists.skills.art"),
    "Esporte": t("lists.skills.sports"),
    "Primeiros Socorros": t("lists.skills.firstAid"),
    "Outros": t("lists.skills.others"),
  };

  const REGION_LABELS: Record<string, string> = {
    "América do Norte": t("lists.regions.northAmerica"),
    "América Central": t("lists.regions.centralAmerica"),
    "América do Sul": t("lists.regions.southAmerica"),
    "Europa Central": t("lists.regions.centralEurope"),
    "Europa Oriental": t("lists.regions.easternEurope"),
    "Ásia": t("lists.regions.asia"),
    "Oceania": t("lists.regions.oceania"),
    "África": t("lists.regions.africa"),
    "Oriente Médio": t("lists.regions.middleEast"),
    "Caribe": t("lists.regions.caribbean"),
  };

  const DURATION_LABELS: Record<string, string> = {
    "1-2 semanas": t("lists.durations.1-2weeks"),
    "3-4 semanas": t("lists.durations.3-4weeks"),
    "1-3 meses": t("lists.durations.1-3months"),
    "3-6 meses": t("lists.durations.3-6months"),
    "+6 meses": t("lists.durations.6plus"),
    "Flexível": t("lists.durations.flexible"),
  };

  const HOST_TYPE_LABELS: Record<string, string> = {
    "ONG / Org. sem fins lucrativos": t("auth.register.hostTypes.ngo"),
    "Família": t("auth.register.hostTypes.family"),
    "Hostel / Albergue": t("auth.register.hostTypes.hostel"),
    "Hotel / Pousada": t("auth.register.hostTypes.hotel"),
    "Fazenda / Sítio": t("auth.register.hostTypes.farm"),
    "Escola / Instituto": t("auth.register.hostTypes.school"),
    "Empresa": t("auth.register.hostTypes.company"),
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Shared fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");

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
  const [selectedDuration, setSelectedDuration] = useState("");
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
          toast.error(t("auth.register.requiredFields"));
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
          dateOfBirth: dateOfBirth || undefined,
          nationality: nationality || undefined,
          passportCountry: passportCountry || undefined,
          bio: biography || undefined,
          travelStyle: travelStyle || undefined,
          languages: selectedLanguages.length ? selectedLanguages : undefined,
          skills: selectedSkills.length ? selectedSkills : undefined,
          regions: selectedRegions.length ? selectedRegions : undefined,
          preferredDuration: selectedDuration || undefined,
          additionalPreferences: additionalPreferences || undefined,
        });
        toast.success(t("auth.register.success"));
        navigate("/dashboard");
      } else {
        if (!email || !orgName) {
          toast.error(t("auth.register.requiredFields"));
          setIsLoading(false);
          return;
        }
        const finalPassword = password || "temp123456";
        await signUp({
          email,
          password: finalPassword,
          fullName: fullName || orgName,
          uiRole: selectedUIRole!,
          phone: phone || undefined,
          orgName,
          orgCountry: country || "Brasil",
          orgAddress: address || undefined,
          orgCity: city || undefined,
          orgState: state || undefined,
          orgPostalCode: postalCode || undefined,
          orgType: hostType || undefined,
        });
        setShowApprovedModal(true);
      }
    } catch (error: any) {
      toast.error(error.message || t("auth.register.error"));
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
      ? t("auth.register.finish")
      : t("auth.register.submitValidation")
    : t("auth.register.next");

  // ---------------------------------------------------------------------------
  // Step Renderers: Viajante
  // ---------------------------------------------------------------------------

  const renderViajantePessoal = () => (
    <div className="flex flex-col gap-4">
      {/* Upload de Documento */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-normal text-[#364153]">
          {t("auth.register.fields.docUpload")}
        </label>
        <label className="cursor-pointer block">
          <input
            type="file"
            className="hidden"
            accept="application/pdf,image/*"
            onChange={(e) => setDocIdentidade(e.target.files?.[0] ?? null)}
          />
          <div className="bg-[#f3f3f3] border border-dashed border-[#dbdbdb] rounded-[14px] p-4 flex flex-col gap-2 items-center justify-center hover:border-[#364763] transition-colors">
            {docIdentidade ? (
              <span className="text-[14px] text-green-600 font-medium">{docIdentidade.name}</span>
            ) : (
              <>
                <Upload className="w-6 h-6 text-[#9c9c9c]" />
                <span className="text-[14px] text-[#9c9c9c] text-center">{t("auth.register.fields.docUploadHint")}</span>
                <span className="text-[14px] text-[#9c9c9c] text-center">{t("auth.register.fields.docFormat")}</span>
              </>
            )}
          </div>
        </label>
        <div className="flex gap-1.5 items-center">
          <Info className="w-3.5 h-3.5 text-[#9c9c9c]" />
          <span className="text-[12px] text-[#9c9c9c]">{t("auth.register.fields.dataEncrypted")}</span>
        </div>
      </div>

      {/* Selfie de Verificação */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-normal text-[#364153]">
          {t("auth.register.fields.selfie")}
        </label>
        <label className="cursor-pointer block">
          <input
            type="file"
            className="hidden"
            accept="image/png,image/jpeg"
            onChange={(e) => setSelfieDoc(e.target.files?.[0] ?? null)}
          />
          <div className="bg-[#f3f3f3] border border-dashed border-[#dbdbdb] rounded-[14px] p-4 flex flex-col gap-2 items-center justify-center hover:border-[#364763] transition-colors">
            {selfieDoc ? (
              <span className="text-[14px] text-green-600 font-medium">{selfieDoc.name}</span>
            ) : (
              <>
                <Upload className="w-6 h-6 text-[#9c9c9c]" />
                <span className="text-[14px] text-[#9c9c9c] text-center">{t("auth.register.fields.selfieHint")}</span>
                <span className="text-[14px] text-[#9c9c9c] text-center">{t("auth.register.fields.docFormat")}</span>
              </>
            )}
          </div>
        </label>
        <span className="text-[12px] text-[#9c9c9c] text-center">{t("auth.register.fields.selfieDesc")}</span>
      </div>

      {/* Por que verificação? */}
      <div
        className="flex gap-4 items-start px-4 py-2.5 rounded-[14px] border"
        style={{ background: "rgba(54,71,99,0.1)", borderColor: "#364763" }}
      >
        <Info className="w-5 h-5 text-[#364763] shrink-0 mt-0.5" />
        <div className="flex flex-col text-[14px] text-[#364763]">
          <span className="font-medium">{t("auth.register.fields.whyVerification")}</span>
          <span className="font-normal">{t("auth.register.fields.verificationDesc")}</span>
        </div>
      </div>

      {/* E-mail + Telefone */}
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="reg-email" className="text-[14px] font-normal text-[#12100f]">{t("auth.register.fields.email")}</label>
          <input
            id="reg-email"
            type="email"
            placeholder={t("auth.register.fields.emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-[50px] px-4 bg-[#f3f3f3] border border-[#dbdbdb] rounded-[10px] text-[14px] text-[#12100f] placeholder:text-[#9c9c9c] focus:outline-none focus:ring-1 focus:ring-[#364763]"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="reg-phone" className="text-[14px] font-normal text-[#12100f]">{t("auth.register.fields.phone")}</label>
          <input
            id="reg-phone"
            type="tel"
            placeholder={t("auth.register.fields.phonePlaceholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-[50px] px-4 bg-[#f3f3f3] border border-[#dbdbdb] rounded-[10px] text-[14px] text-[#12100f] placeholder:text-[#9c9c9c] focus:outline-none focus:ring-1 focus:ring-[#364763]"
          />
        </div>
      </div>

      {/* Senha + Confirmar senha */}
      <div className="flex gap-4">
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="reg-password" className="text-[14px] font-normal text-[#12100f]">{t("auth.register.fields.password")}</label>
          <input
            id="reg-password"
            type="password"
            placeholder={t("auth.register.fields.password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[50px] px-4 bg-[#f3f3f3] border border-[#dbdbdb] rounded-[10px] text-[14px] text-[#12100f] placeholder:text-[#9c9c9c] focus:outline-none focus:ring-1 focus:ring-[#364763]"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="reg-confirm" className="text-[14px] font-normal text-[#12100f]">{t("auth.register.fields.confirmPassword")}</label>
          <input
            id="reg-confirm"
            type="password"
            placeholder={t("auth.register.fields.confirmPasswordPlaceholder")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-[50px] px-4 bg-[#f3f3f3] border border-[#dbdbdb] rounded-[10px] text-[14px] text-[#12100f] placeholder:text-[#9c9c9c] focus:outline-none focus:ring-1 focus:ring-[#364763]"
          />
        </div>
      </div>
    </div>
  );

  const renderViajanteVerificacao = () => (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="reg-fullname">{t("auth.register.fields.fullName")}</Label>
        <Input
          id="reg-fullname"
          placeholder={t("auth.register.fields.fullNamePlaceholder")}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-dob">{t("auth.register.fields.birthDate")}</Label>
        <Input
          id="reg-dob"
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-nationality">{t("auth.register.fields.nationality")}</Label>
        <Input
          id="reg-nationality"
          placeholder={t("auth.register.fields.nationalityPlaceholder")}
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-passport">{t("auth.register.fields.passportCountry")}</Label>
        <Input
          id="reg-passport"
          placeholder={t("auth.register.fields.passportCountryPlaceholder")}
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
        <Label className="text-base font-semibold mb-3 block">{t("auth.register.fields.languages")}</Label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <Chip
              key={lang}
              label={LANGUAGE_LABELS[lang] ?? lang}
              selected={selectedLanguages.includes(lang)}
              onClick={() => setSelectedLanguages(toggleChip(selectedLanguages, lang))}
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">{t("auth.register.fields.skills")}</Label>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <Chip
              key={skill}
              label={SKILL_LABELS[skill] ?? skill}
              selected={selectedSkills.includes(skill)}
              onClick={() => setSelectedSkills(toggleChip(selectedSkills, skill))}
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-2 block">{t("auth.register.fields.resume")}</Label>
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
                <span className="text-sm text-gray-500 text-center">{t("auth.register.fields.resumeHint")}</span>
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
        <Label htmlFor="reg-bio">{t("auth.register.fields.bio")}</Label>
        <Textarea
          id="reg-bio"
          placeholder={t("auth.register.fields.bioPlaceholder")}
          value={biography}
          onChange={(e) => setBiography(e.target.value)}
          className="bg-gray-50 min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-travel-style">{t("auth.register.fields.travelStyle")}</Label>
        <Input
          id="reg-travel-style"
          placeholder={t("auth.register.fields.travelStylePlaceholder")}
          value={travelStyle}
          onChange={(e) => setTravelStyle(e.target.value)}
          className="bg-gray-50"
        />
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          {t("auth.register.fields.profilePhotos")}{" "}
          <span className="text-sm font-normal text-gray-500">{t("auth.register.fields.profilePhotosMin")}</span>
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
        {t("auth.register.fields.profilePhotosHint")}
      </InfoBox>
    </div>
  );

  const renderViajanteViagens = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold mb-3 block">{t("auth.register.fields.regions")}</Label>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <Chip
              key={region}
              label={REGION_LABELS[region] ?? region}
              selected={selectedRegions.includes(region)}
              onClick={() => setSelectedRegions(toggleChip(selectedRegions, region))}
            />
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">{t("auth.register.fields.preferredDuration")}</Label>
        <select
          value={selectedDuration}
          onChange={(e) => setSelectedDuration(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm text-tc-text-primary focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
        >
          <option value="">{t("settings.account.selectPlaceholder")}</option>
          {DURATIONS.map((dur) => (
            <option key={dur} value={dur}>{DURATION_LABELS[dur] ?? dur}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-prefs">{t("auth.register.fields.additionalPrefs")}</Label>
        <Textarea
          id="reg-prefs"
          placeholder={t("auth.register.fields.additionalPrefsPlaceholder")}
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
        <Label htmlFor="reg-orgname">{t("auth.register.fields.orgName")}</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <Input
            id="reg-orgname"
            placeholder={t("auth.register.fields.orgNamePlaceholder")}
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="bg-gray-50 pl-9"
          />
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold mb-3 block">
          {t("auth.register.fields.hostType")}<span className="text-rose-500"> *</span>
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
              <span className="text-sm font-medium text-tc-text-primary">
                {HOST_TYPE_LABELS[ht.label] ?? ht.label}
              </span>
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
          {t("auth.register.fields.address")}<span className="text-rose-500">*</span>
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tc-text-hint" />
          <Input
            id="reg-address"
            placeholder={t("auth.register.fields.addressPlaceholder")}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-gray-50 pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-city">
            {t("auth.register.fields.city")}<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-city"
            placeholder={t("auth.register.fields.city")}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-state">
            {t("auth.register.fields.state")}<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-state"
            placeholder={t("auth.register.fields.statePlaceholder")}
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-country">
            {t("auth.register.fields.country")}<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-country"
            placeholder={t("auth.register.fields.country")}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-postal">
            {t("auth.register.fields.postalCode")}<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-postal"
            placeholder={t("auth.register.fields.postalCode")}
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
          {t("auth.register.fields.selectHostTypeFirst")}
        </p>
        <button
          type="button"
          onClick={() => setCurrentStep(0)}
          className="text-sm text-navy-500 font-medium hover:underline"
        >
          {t("auth.register.fields.goToOrganization")}
        </button>
      </div>
    );
  };

  const renderAnfitriaoFinalizacao = () => (
    <div className="space-y-5">
      {/* Photo upload */}
      <div>
        <Label className="text-base font-semibold mb-3 block">
          {t("auth.register.fields.locationPhotos")}<span className="text-rose-500">*</span>{" "}
          <span className="text-sm font-normal text-tc-text-hint">{t("auth.register.fields.locationPhotosMin")}</span>
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
              {t("auth.register.fields.locationPhotosHint")}
            </span>
            <span className="text-xs text-tc-text-hint">{t("auth.register.fields.locationPhotosFormat")}</span>
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
          {t("auth.register.fields.locationPhotosCount", { count: hostPhotos.length })}
        </p>
      </div>

      {/* Declaração de Veracidade */}
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
              {t("auth.register.fields.declaration")}<span className="text-rose-500"> *</span>
            </label>
            <p className="text-xs text-tc-text-secondary leading-relaxed mt-1">
              {t("auth.register.fields.declarationText")}
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
          {t("auth.register.fields.termsPrefix")}{" "}
          <Link to="#" className="text-rose-500 font-semibold hover:underline">
            {t("auth.register.fields.terms")}
          </Link>{" "}
          {t("auth.register.fields.termsAnd")}{" "}
          <Link to="#" className="text-rose-500 font-semibold hover:underline">
            {t("auth.register.fields.privacy")}
          </Link>
          <span className="text-rose-500">*</span>
        </label>
      </div>

      {/* Próximos Passos */}
      <div className="flex gap-3 items-start border border-rose-200 rounded-lg p-4 bg-rose-50">
        <CheckCircle2 className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-tc-text-primary">
            {t("auth.register.fields.nextSteps")}
          </p>
          <p className="text-xs text-tc-text-secondary leading-relaxed mt-1">
            {t("auth.register.fields.nextStepsDesc")}
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
      <div className="w-full max-w-lg space-y-5 py-4">

        {/* Mobile logo */}
        <div className="flex justify-center lg:hidden">
          <Logo size="md" />
        </div>

        {/* Progresso */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[16px]">
            <span className="font-normal text-[#12100f]">
              {t("auth.register.stepOf", { current: currentStep + 1, total: totalSteps })}
            </span>
            <span className="font-normal text-[#3f444c]">{Math.round(progressPercent)}%</span>
          </div>
          {/* Barra */}
          <div className="w-full h-[10px] bg-[#dbdbdb] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPercent}%`, background: "#364763" }}
            />
          </div>
          {/* Step labels */}
          <div className="flex justify-between">
            {stepLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setCurrentStep(index)}
                className="text-[14px] transition-colors"
                style={{
                  fontWeight: index === currentStep ? 500 : 400,
                  color: index === currentStep ? "#364763" : "#9c9c9c",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Card do formulário */}
        <Card className="border border-[#dbdbdb] rounded-[10px] shadow-none">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-[16px] font-medium text-[#12100f]">
              {isViajante ? t("auth.register.viajante") : t("auth.register.anfitriao")}
            </CardTitle>
            <CardDescription className="text-[14px] font-normal text-[#3f444c]">
              {isViajante
                ? t("auth.register.completeProfileTraveler")
                : t("auth.register.completeProfileHost")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderCurrentStep()}

            {/* Anfitrião: botões dentro do card */}
            {!isViajante && (
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={currentStep > 0 ? goBack : () => navigate("/login")}
                  className="flex-1 py-3 rounded-[10px] border border-[#364763] text-[14px] font-normal text-[#364763] hover:opacity-80 transition-opacity"
                >
                  {t("auth.register.back")}
                </button>
                <button
                  type="button"
                  onClick={handleNextOrSubmit}
                  disabled={isLoading || (isLastStep && (!declarationAccepted || !termsAccepted))}
                  className="flex-1 py-3 rounded-[10px] text-[14px] font-normal text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ background: "#364763" }}
                >
                  {isLoading ? t("auth.register.submitting") : nextLabel}
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Viajante: botões fora do card */}
        {isViajante && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={currentStep > 0 ? goBack : () => navigate("/login")}
              className="flex-1 py-3 rounded-[10px] border border-[#364763] text-[14px] font-normal text-[#364763] hover:opacity-80 transition-opacity"
            >
              {t("auth.register.back")}
            </button>
            <button
              type="button"
              onClick={handleNextOrSubmit}
              disabled={isLoading}
              className="flex-1 py-3 rounded-[10px] text-[14px] font-normal text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "#364763" }}
            >
              {isLoading ? t("auth.register.submitting") : nextLabel}
            </button>
          </div>
        )}

        {/* Link login */}
        <p className="text-center text-[14px] pb-4">
          <span className="font-normal text-[#3f444c]">{t("auth.register.hasAccount")} </span>
          <Link to="/login" className="font-medium text-[#cf3952] hover:underline">
            {t("auth.register.login")}
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

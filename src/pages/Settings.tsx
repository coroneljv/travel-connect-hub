import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  User,
  Bell,
  Lock,
  Globe,
  CreditCard,
  LogOut,
  Loader2,
  Clock,
  Camera,
  Building2,
} from "lucide-react";

type SettingsTab = "conta" | "notificacoes" | "seguranca" | "idioma" | "pagamento";

interface NotifPrefs {
  email: boolean;
  push: boolean;
  marketing: boolean;
}

interface LangPrefs {
  language: string;
  timezone: string;
}

const DEFAULT_NOTIF_PREFS: NotifPrefs = { email: true, push: true, marketing: false };
const DEFAULT_LANG_PREFS: LangPrefs = { language: "pt-BR", timezone: "America/Sao_Paulo" };

// These are stored to DB — must stay as pt-BR values
const LANGUAGE_KEYS = [
  "Inglês", "Espanhol", "Alemão", "Português", "Francês", "Italiano",
  "Mandarim", "Japonês", "Russo", "Árabe", "Holandês", "Coreano",
];

const SKILL_KEYS = [
  "Ensino de inglês", "Atendimento ao Cliente", "Cozinhar", "Limpeza",
  "Jardinagem", "Marketing Digital", "Construção", "Fotografia",
  "Design", "Ensino", "Agricultura", "Cuidado de Animais",
  "Manutenção", "Recepção", "Programação", "Música", "Arte",
  "Esporte", "Primeiros Socorros", "Outros",
];

const REGION_KEYS = [
  "América do Norte", "América Central", "América do Sul", "Europa Central",
  "Europa Oriental", "Ásia", "Oceania", "África", "Oriente Médio", "Caribe",
];

const DURATION_KEYS = [
  "1-2 semanas", "3-4 semanas", "1-3 meses", "3-6 meses", "+6 meses", "Flexível",
];

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore parse errors
  }
  return fallback;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `+${digits}`;
  if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
  if (digits.length <= 9)
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
  if (digits.length <= 13)
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
}

function ChipSelect({
  options,
  selected,
  onChange,
  getLabel,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  getLabel?: (opt: string) => string;
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selected.includes(opt)
              ? "bg-rose-500 text-white"
              : "bg-white border border-gray-300 text-tc-text-primary hover:border-gray-400"
          }`}
        >
          {getLabel ? getLabel(opt) : opt}
        </button>
      ))}
    </div>
  );
}

export default function Settings() {
  const { t } = useTranslation();
  const { profile, user, uiRole, organization, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("conta");

  // Label maps for chips (values stay pt-BR for DB, display is translated)
  const langLabel = (v: string): string => ({
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
  }[v] ?? v);

  const skillLabel = (v: string): string => ({
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
  }[v] ?? v);

  const regionLabel = (v: string): string => ({
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
  }[v] ?? v);

  const durationLabel = (v: string): string => ({
    "1-2 semanas": t("lists.durations.1-2weeks"),
    "3-4 semanas": t("lists.durations.3-4weeks"),
    "1-3 meses": t("lists.durations.1-3months"),
    "3-6 meses": t("lists.durations.3-6months"),
    "+6 meses": t("lists.durations.6plus"),
    "Flexível": t("lists.durations.flexible"),
  }[v] ?? v);

  const TABS: { key: SettingsTab; icon: React.ReactNode }[] = [
    { key: "conta", icon: <User className="h-4 w-4" /> },
    { key: "notificacoes", icon: <Bell className="h-4 w-4" /> },
    { key: "seguranca", icon: <Lock className="h-4 w-4" /> },
    { key: "idioma", icon: <Globe className="h-4 w-4" /> },
    { key: "pagamento", icon: <CreditCard className="h-4 w-4" /> },
  ];

  const TAB_LABELS: Record<SettingsTab, string> = {
    conta: t("settings.tabs.account"),
    notificacoes: t("settings.tabs.notifications"),
    seguranca: t("settings.tabs.security"),
    idioma: t("settings.tabs.language"),
    pagamento: t("settings.tabs.payment"),
  };

  // --- Conta ---
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");
  const [passportCountry, setPassportCountry] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Viajante fields
  const [languages, setLanguages] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [preferredDuration, setPreferredDuration] = useState("");
  const [additionalPreferences, setAdditionalPreferences] = useState("");

  // Anfitrião org fields
  const [orgName, setOrgName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgState, setOrgState] = useState("");
  const [orgCountry, setOrgCountry] = useState("");
  const [orgPostalCode, setOrgPostalCode] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setBio(profile.bio ?? "");
      setDateOfBirth(profile.date_of_birth ?? "");
      setNationality(profile.nationality ?? "");
      setPassportCountry(profile.passport_country ?? "");
      setTravelStyle(profile.travel_style ?? "");
      setAvatarUrl(profile.avatar_url ?? "");
      setLanguages(profile.languages ?? []);
      setSkills(profile.skills ?? []);
      setRegions(profile.regions ?? []);
      setPreferredDuration(profile.preferred_duration ?? "");
      setAdditionalPreferences(profile.additional_preferences ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name ?? "");
      setOrgDescription(organization.description ?? "");
      setOrgCountry(organization.country ?? "");
      setOrgWebsite(organization.website ?? "");
      setOrgPhone(organization.phone ?? "");
      setOrgEmail(organization.email ?? "");
      setOrgAddress(organization.address ?? "");
      setOrgCity(organization.city ?? "");
      setOrgState(organization.state ?? "");
      setOrgPostalCode(organization.postal_code ?? "");
    }
  }, [organization]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${profile.id}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = urlData.publicUrl;
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", profile.id);
      if (error) throw error;
      setAvatarUrl(url);
      await refreshProfile();
      toast.success(t("settings.toasts.photoUpdated"));
    } catch (err: any) {
      toast.error(err.message ?? t("settings.toasts.photoError"));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone,
          bio,
          date_of_birth: dateOfBirth || null,
          nationality: nationality || null,
          passport_country: passportCountry || null,
          travel_style: travelStyle || null,
          languages: languages.length ? languages : [],
          skills: skills.length ? skills : [],
          regions: regions.length ? regions : [],
          preferred_duration: preferredDuration || null,
          additional_preferences: additionalPreferences || null,
        })
        .eq("id", profile.id);
      if (error) throw error;
      await refreshProfile();
      toast.success(t("settings.toasts.dataSaved"));
    } catch (err: any) {
      toast.error(err.message ?? t("settings.toasts.dataSaveError"));
    } finally {
      setSavingProfile(false);
    }
  };

  // --- Notificacoes ---
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>(DEFAULT_NOTIF_PREFS);

  useEffect(() => {
    setNotifPrefs(loadJson<NotifPrefs>("tc_notif_prefs", DEFAULT_NOTIF_PREFS));
  }, []);

  const updateNotif = (key: keyof NotifPrefs, value: boolean) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveNotif = () => {
    localStorage.setItem("tc_notif_prefs", JSON.stringify(notifPrefs));
    toast.success(t("settings.toasts.notifSaved"));
  };

  // --- Seguranca ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error(t("settings.security.passwordHint"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("settings.security.passwordMismatch"));
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(t("settings.security.passwordChanged"));
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message ?? t("settings.security.passwordError"));
    } finally {
      setSavingPassword(false);
    }
  };

  // --- Idioma ---
  const [langPrefs, setLangPrefs] = useState<LangPrefs>(DEFAULT_LANG_PREFS);

  useEffect(() => {
    setLangPrefs(loadJson<LangPrefs>("tc_lang_prefs", DEFAULT_LANG_PREFS));
  }, []);

  const handleSaveLang = () => {
    localStorage.setItem("tc_lang_prefs", JSON.stringify(langPrefs));
    i18n.changeLanguage(langPrefs.language);
    toast.success(t("settings.toasts.langSaved"));
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-tc-text-primary mb-6">{t("settings.title")}</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="md:w-56 shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  activeTab === tab.key
                    ? "bg-navy-50 text-navy-600"
                    : "text-tc-text-secondary hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {TAB_LABELS[tab.key]}
              </button>
            ))}
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left mt-4"
            >
              <LogOut className="h-4 w-4" />
              {t("common.logout")}
            </button>
          </nav>
        </div>

        {/* Content area */}
        <div className="flex-1">
          {/* ====== CONTA ====== */}
          {activeTab === "conta" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("settings.account.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-16 w-16 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-bold text-lg">
                        {fullName?.slice(0, 2).toUpperCase() || "?"}
                      </div>
                    )}
                    <label
                      htmlFor="avatar-upload"
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-rose-500 flex items-center justify-center cursor-pointer hover:bg-rose-600 transition-colors"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
                      ) : (
                        <Camera className="h-3.5 w-3.5 text-white" />
                      )}
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t("settings.account.profilePhoto")}</p>
                    <p className="text-xs text-tc-text-hint">{t("settings.account.photoHint")}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">{t("settings.account.fullName")}</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t("settings.account.fullNamePlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t("settings.account.email")}</Label>
                  <Input
                    id="email"
                    value={user?.email ?? ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-tc-text-hint mt-1">
                    {t("settings.account.emailHint")}
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">{t("settings.account.phone")}</Label>
                  <Input
                    id="phone"
                    value={formatPhone(phone)}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder={t("settings.account.phonePlaceholder")}
                    maxLength={19}
                  />
                </div>
                <div>
                  <Label htmlFor="dob">{t("settings.account.birthDate")}</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">{t("settings.account.nationality")}</Label>
                  <Input
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder={t("settings.account.nationalityPlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="passport">{t("settings.account.passportCountry")}</Label>
                  <Input
                    id="passport"
                    value={passportCountry}
                    onChange={(e) => setPassportCountry(e.target.value)}
                    placeholder={t("settings.account.passportCountryPlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="travel-style">{t("settings.account.travelStyle")}</Label>
                  <select
                    id="travel-style"
                    className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                  >
                    <option value="">{t("settings.account.selectPlaceholder")}</option>
                    <option value="Mochileiro">{t("settings.account.travelStyles.backpacker")}</option>
                    <option value="Voluntario">{t("settings.account.travelStyles.volunteer")}</option>
                    <option value="Nomade Digital">{t("settings.account.travelStyles.digitalNomad")}</option>
                    <option value="Aventureiro">{t("settings.account.travelStyles.adventurer")}</option>
                    <option value="Cultural">{t("settings.account.travelStyles.cultural")}</option>
                    <option value="Ecologico">{t("settings.account.travelStyles.ecological")}</option>
                    <option value="Luxo">{t("settings.account.travelStyles.luxury")}</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="bio">{t("settings.account.bio")}</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={t("settings.account.bioPlaceholder")}
                    rows={4}
                  />
                </div>

                {/* Viajante-specific fields */}
                {uiRole === "viajante" && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-tc-text-primary mb-3">{t("settings.account.languages")}</h3>
                      <ChipSelect options={LANGUAGE_KEYS} selected={languages} onChange={setLanguages} getLabel={langLabel} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-tc-text-primary mb-3">{t("settings.account.skills")}</h3>
                      <ChipSelect options={SKILL_KEYS} selected={skills} onChange={setSkills} getLabel={skillLabel} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-tc-text-primary mb-3">{t("settings.account.regions")}</h3>
                      <ChipSelect options={REGION_KEYS} selected={regions} onChange={setRegions} getLabel={regionLabel} />
                    </div>

                    <div>
                      <Label htmlFor="preferred-duration">{t("settings.account.preferredDuration")}</Label>
                      <select
                        id="preferred-duration"
                        className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"
                        value={preferredDuration}
                        onChange={(e) => setPreferredDuration(e.target.value)}
                      >
                        <option value="">{t("settings.account.selectPlaceholder")}</option>
                        {DURATION_KEYS.map((d) => (
                          <option key={d} value={d}>{durationLabel(d)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="add-prefs">{t("settings.account.additionalPrefs")}</Label>
                      <Textarea
                        id="add-prefs"
                        value={additionalPreferences}
                        onChange={(e) => setAdditionalPreferences(e.target.value)}
                        placeholder={t("settings.account.additionalPrefsPlaceholder")}
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t("settings.account.saveChanges")}
                </Button>

                {/* Anfitrião organization card */}
                {uiRole === "anfitriao" && organization && (
                  <div className="border-t pt-6 mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-tc-text-primary flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {t("settings.organization.title")}
                    </h3>
                    <div>
                      <Label htmlFor="org-name">{t("settings.organization.name")}</Label>
                      <Input
                        id="org-name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder={t("settings.organization.namePlaceholder")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-description">{t("settings.organization.description")}</Label>
                      <Textarea
                        id="org-description"
                        value={orgDescription}
                        onChange={(e) => setOrgDescription(e.target.value)}
                        placeholder={t("settings.organization.descriptionPlaceholder")}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="org-country">{t("settings.organization.country")}</Label>
                        <Input id="org-country" value={orgCountry} onChange={(e) => setOrgCountry(e.target.value)} placeholder={t("settings.organization.country")} />
                      </div>
                      <div>
                        <Label htmlFor="org-website">{t("settings.organization.website")}</Label>
                        <Input id="org-website" value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} placeholder={t("settings.organization.websitePlaceholder")} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="org-email">{t("settings.organization.email")}</Label>
                        <Input id="org-email" type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} placeholder={t("settings.organization.emailPlaceholder")} />
                      </div>
                      <div>
                        <Label htmlFor="org-phone">{t("settings.organization.phone")}</Label>
                        <Input id="org-phone" value={formatPhone(orgPhone)} onChange={(e) => setOrgPhone(e.target.value.replace(/\D/g, ""))} placeholder={t("settings.organization.phonePlaceholder")} />
                      </div>
                    </div>
                    <Button
                      onClick={async () => {
                        if (!organization?.id) return;
                        setSavingOrg(true);
                        try {
                          const { error } = await supabase
                            .from("organizations")
                            .update({
                              name: orgName,
                              description: orgDescription || null,
                              country: orgCountry || null,
                              website: orgWebsite || null,
                              email: orgEmail || null,
                              phone: orgPhone || null,
                            })
                            .eq("id", organization.id);
                          if (error) throw error;
                          await refreshProfile();
                          toast.success(t("settings.toasts.orgSaved"));
                        } catch (err: any) {
                          toast.error(err.message ?? t("settings.toasts.orgSaveError"));
                        } finally {
                          setSavingOrg(false);
                        }
                      }}
                      disabled={savingOrg}
                    >
                      {savingOrg && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {t("settings.organization.save")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ====== NOTIFICACOES ====== */}
          {activeTab === "notificacoes" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("settings.notifications.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-tc-text-primary">
                      {t("settings.notifications.emailNotif")}
                    </p>
                    <p className="text-xs text-tc-text-hint">
                      {t("settings.notifications.emailNotifDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={notifPrefs.email}
                    onCheckedChange={(v) => updateNotif("email", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-tc-text-primary">
                      {t("settings.notifications.pushNotif")}
                    </p>
                    <p className="text-xs text-tc-text-hint">
                      {t("settings.notifications.pushNotifDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={notifPrefs.push}
                    onCheckedChange={(v) => updateNotif("push", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-tc-text-primary">
                      {t("settings.notifications.marketingEmails")}
                    </p>
                    <p className="text-xs text-tc-text-hint">
                      {t("settings.notifications.marketingEmailsDesc")}
                    </p>
                  </div>
                  <Switch
                    checked={notifPrefs.marketing}
                    onCheckedChange={(v) => updateNotif("marketing", v)}
                  />
                </div>
                <Button onClick={handleSaveNotif}>{t("settings.notifications.savePreferences")}</Button>
              </CardContent>
            </Card>
          )}

          {/* ====== SEGURANCA ====== */}
          {activeTab === "seguranca" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("settings.security.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-pw">{t("settings.security.newPassword")}</Label>
                  <Input
                    id="new-pw"
                    type="password"
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-pw">{t("settings.security.confirmPassword")}</Label>
                  <Input
                    id="confirm-pw"
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={savingPassword}>
                  {savingPassword && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {t("settings.security.changePassword")}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ====== IDIOMA ====== */}
          {activeTab === "idioma" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("settings.language.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t("settings.language.language")}</Label>
                  <select
                    className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={langPrefs.language}
                    onChange={(e) =>
                      setLangPrefs((prev) => ({ ...prev, language: e.target.value }))
                    }
                  >
                    <option value="pt-BR">{t("settings.language.options.ptBR")}</option>
                    <option value="en">{t("settings.language.options.en")}</option>
                    <option value="es">{t("settings.language.options.es")}</option>
                  </select>
                </div>
                <div>
                  <Label>{t("settings.language.timezone")}</Label>
                  <select
                    className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={langPrefs.timezone}
                    onChange={(e) =>
                      setLangPrefs((prev) => ({ ...prev, timezone: e.target.value }))
                    }
                  >
                    <option value="America/Sao_Paulo">{t("settings.language.timezones.saoPaulo")}</option>
                    <option value="America/New_York">{t("settings.language.timezones.newYork")}</option>
                    <option value="Europe/London">{t("settings.language.timezones.london")}</option>
                    <option value="Europe/Lisbon">{t("settings.language.timezones.lisbon")}</option>
                    <option value="Asia/Tokyo">{t("settings.language.timezones.tokyo")}</option>
                  </select>
                </div>
                <Button onClick={handleSaveLang}>{t("settings.language.save")}</Button>
              </CardContent>
            </Card>
          )}

          {/* ====== PAGAMENTO ====== */}
          {activeTab === "pagamento" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("settings.payment.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-50">
                    <Clock className="h-7 w-7 text-navy-500" />
                  </div>
                  <p className="text-base font-medium text-tc-text-primary mb-1">
                    {t("common.comingSoon")}
                  </p>
                  <p className="text-sm text-tc-text-secondary max-w-xs mx-auto">
                    {t("settings.payment.comingSoonDesc")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

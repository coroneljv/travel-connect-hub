import { useState, useEffect } from "react";
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

const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: "conta", label: "Conta", icon: <User className="h-4 w-4" /> },
  { key: "notificacoes", label: "Notificações", icon: <Bell className="h-4 w-4" /> },
  { key: "seguranca", label: "Segurança", icon: <Lock className="h-4 w-4" /> },
  { key: "idioma", label: "Idioma", icon: <Globe className="h-4 w-4" /> },
  { key: "pagamento", label: "Pagamento", icon: <CreditCard className="h-4 w-4" /> },
];

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

const LANGUAGES = [
  "Inglês", "Espanhol", "Alemão", "Português", "Francês", "Italiano",
  "Mandarim", "Japonês", "Russo", "Árabe", "Holandês", "Coreano",
];

const SKILLS = [
  "Ensino de inglês", "Atendimento ao Cliente", "Cozinhar", "Limpeza",
  "Jardinagem", "Marketing Digital", "Construção", "Fotografia",
  "Design", "Ensino", "Agricultura", "Cuidado de Animais",
  "Manutenção", "Recepção", "Programação", "Música", "Arte",
  "Esporte", "Primeiros Socorros", "Outros",
];

const REGIONS = [
  "América do Norte", "América Central", "América do Sul", "Europa Central",
  "Europa Oriental", "Ásia", "Oceania", "África", "Oriente Médio", "Caribe",
];

const DURATIONS = [
  "1-2 semanas", "3-4 semanas", "1-3 meses", "3-6 meses", "+6 meses", "Flexível",
];

function ChipSelect({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
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
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function Settings() {
  const { profile, user, uiRole, organization, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("conta");

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
      toast.success("Foto atualizada!");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao enviar foto.");
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
      toast.success("Dados atualizados com sucesso!");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar alterações.");
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
    toast.success("Preferências de notificação salvas!");
  };

  // --- Seguranca ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao alterar senha.");
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
    toast.success("Preferências de idioma salvas!");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-tc-text-primary mb-6">Configurações</h1>

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
                {tab.label}
              </button>
            ))}
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left mt-4"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </nav>
        </div>

        {/* Content area */}
        <div className="flex-1">
          {/* ====== CONTA ====== */}
          {activeTab === "conta" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações da Conta</CardTitle>
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
                    <p className="text-sm font-medium">Foto de Perfil</p>
                    <p className="text-xs text-tc-text-hint">JPG, PNG. Recomendado 200x200px.</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    value={user?.email ?? ""}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-tc-text-hint mt-1">
                    O e-mail não pode ser alterado por aqui.
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formatPhone(phone)}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="+55 (48) 99999-9999"
                    maxLength={19}
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Data de nascimento</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nacionalidade</Label>
                  <Input
                    id="nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="Ex: Brasileira"
                  />
                </div>
                <div>
                  <Label htmlFor="passport">País do passaporte</Label>
                  <Input
                    id="passport"
                    value={passportCountry}
                    onChange={(e) => setPassportCountry(e.target.value)}
                    placeholder="Ex: Brasil"
                  />
                </div>
                <div>
                  <Label htmlFor="travel-style">Estilo de viagem</Label>
                  <select
                    id="travel-style"
                    className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Mochileiro">Mochileiro</option>
                    <option value="Voluntario">Voluntário</option>
                    <option value="Nomade Digital">Nômade Digital</option>
                    <option value="Aventureiro">Aventureiro</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Ecologico">Ecológico</option>
                    <option value="Luxo">Luxo</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    rows={4}
                  />
                </div>

                {/* Viajante-specific fields */}
                {uiRole === "viajante" && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-sm font-semibold text-tc-text-primary mb-3">Idiomas</h3>
                      <ChipSelect options={LANGUAGES} selected={languages} onChange={setLanguages} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-tc-text-primary mb-3">Habilidades</h3>
                      <ChipSelect options={SKILLS} selected={skills} onChange={setSkills} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-tc-text-primary mb-3">Regiões de Interesse</h3>
                      <ChipSelect options={REGIONS} selected={regions} onChange={setRegions} />
                    </div>

                    <div>
                      <Label htmlFor="preferred-duration">Duração Preferida</Label>
                      <select
                        id="preferred-duration"
                        className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"
                        value={preferredDuration}
                        onChange={(e) => setPreferredDuration(e.target.value)}
                      >
                        <option value="">Selecione...</option>
                        {DURATIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="add-prefs">Preferências Adicionais</Label>
                      <Textarea
                        id="add-prefs"
                        value={additionalPreferences}
                        onChange={(e) => setAdditionalPreferences(e.target.value)}
                        placeholder="Alguma preferência ou necessidade especial?"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar Alterações
                </Button>

                {/* Anfitrião organization card */}
                {uiRole === "anfitriao" && organization && (
                  <div className="border-t pt-6 mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-tc-text-primary flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Dados da Organização
                    </h3>
                    <div>
                      <Label htmlFor="org-name">Nome da Organização</Label>
                      <Input
                        id="org-name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        placeholder="Nome da organização"
                      />
                    </div>
                    <div>
                      <Label htmlFor="org-description">Descrição</Label>
                      <Textarea
                        id="org-description"
                        value={orgDescription}
                        onChange={(e) => setOrgDescription(e.target.value)}
                        placeholder="Descreva sua organização..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="org-country">País</Label>
                        <Input id="org-country" value={orgCountry} onChange={(e) => setOrgCountry(e.target.value)} placeholder="País" />
                      </div>
                      <div>
                        <Label htmlFor="org-website">Website</Label>
                        <Input id="org-website" value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} placeholder="https://..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="org-email">E-mail da Organização</Label>
                        <Input id="org-email" type="email" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} placeholder="contato@org.com" />
                      </div>
                      <div>
                        <Label htmlFor="org-phone">Telefone da Organização</Label>
                        <Input id="org-phone" value={formatPhone(orgPhone)} onChange={(e) => setOrgPhone(e.target.value.replace(/\D/g, ""))} placeholder="+55 (48) 99999-9999" />
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
                          toast.success("Dados da organização atualizados!");
                        } catch (err: any) {
                          toast.error(err.message ?? "Erro ao salvar organização.");
                        } finally {
                          setSavingOrg(false);
                        }
                      }}
                      disabled={savingOrg}
                    >
                      {savingOrg && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Salvar Organização
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
                <CardTitle className="text-lg">Preferências de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-tc-text-primary">
                      Notificações por e-mail
                    </p>
                    <p className="text-xs text-tc-text-hint">
                      Receba atualizações sobre candidaturas e mensagens
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
                      Notificações push
                    </p>
                    <p className="text-xs text-tc-text-hint">
                      Receba alertas no navegador
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
                      E-mails de marketing
                    </p>
                    <p className="text-xs text-tc-text-hint">
                      Novidades, dicas e promoções
                    </p>
                  </div>
                  <Switch
                    checked={notifPrefs.marketing}
                    onCheckedChange={(v) => updateNotif("marketing", v)}
                  />
                </div>
                <Button onClick={handleSaveNotif}>Salvar Preferências</Button>
              </CardContent>
            </Card>
          )}

          {/* ====== SEGURANCA ====== */}
          {activeTab === "seguranca" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Segurança</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-pw">Nova senha</Label>
                  <Input
                    id="new-pw"
                    type="password"
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm-pw">Confirmar nova senha</Label>
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
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ====== IDIOMA ====== */}
          {activeTab === "idioma" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Idioma e Região</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Idioma</Label>
                  <select
                    className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={langPrefs.language}
                    onChange={(e) =>
                      setLangPrefs((prev) => ({ ...prev, language: e.target.value }))
                    }
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div>
                  <Label>Fuso horário</Label>
                  <select
                    className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={langPrefs.timezone}
                    onChange={(e) =>
                      setLangPrefs((prev) => ({ ...prev, timezone: e.target.value }))
                    }
                  >
                    <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                    <option value="Europe/Lisbon">Lisboa (GMT+0)</option>
                    <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                  </select>
                </div>
                <Button onClick={handleSaveLang}>Salvar</Button>
              </CardContent>
            </Card>
          )}

          {/* ====== PAGAMENTO ====== */}
          {activeTab === "pagamento" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métodos de Pagamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy-50">
                    <Clock className="h-7 w-7 text-navy-500" />
                  </div>
                  <p className="text-base font-medium text-tc-text-primary mb-1">
                    Em breve
                  </p>
                  <p className="text-sm text-tc-text-secondary max-w-xs mx-auto">
                    Estamos preparando a integração com meios de pagamento. Você será
                    notificado quando estiver disponível.
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

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
} from "lucide-react";

type SettingsTab = "conta" | "notificacoes" | "seguranca" | "idioma" | "pagamento";

const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: "conta", label: "Conta", icon: <User className="h-4 w-4" /> },
  { key: "notificacoes", label: "Notificacoes", icon: <Bell className="h-4 w-4" /> },
  { key: "seguranca", label: "Seguranca", icon: <Lock className="h-4 w-4" /> },
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

export default function Settings() {
  const { profile, user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("conta");

  // --- Conta ---
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone((profile as any).phone ?? "");
      setBio((profile as any).bio ?? "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone, bio })
        .eq("id", profile.id);
      if (error) throw error;
      toast.success("Dados atualizados com sucesso!");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar alteracoes.");
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
    toast.success("Preferencias de notificacao salvas!");
  };

  // --- Seguranca ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("A senha deve ter no minimo 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas nao coincidem.");
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
    toast.success("Preferencias de idioma salvas!");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-tc-text-primary mb-6">Configuracoes</h1>

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
                <CardTitle className="text-lg">Informacoes da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    O e-mail nao pode ser alterado por aqui.
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+55 (11) 99999-9999"
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Conte um pouco sobre voce..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Salvar Alteracoes
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ====== NOTIFICACOES ====== */}
          {activeTab === "notificacoes" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preferencias de Notificacao</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-tc-text-primary">
                      Notificacoes por e-mail
                    </p>
                    <p className="text-xs text-tc-text-hint">
                      Receba atualizacoes sobre candidaturas e mensagens
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
                      Notificacoes push
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
                      Novidades, dicas e promocoes
                    </p>
                  </div>
                  <Switch
                    checked={notifPrefs.marketing}
                    onCheckedChange={(v) => updateNotif("marketing", v)}
                  />
                </div>
                <Button onClick={handleSaveNotif}>Salvar Preferencias</Button>
              </CardContent>
            </Card>
          )}

          {/* ====== SEGURANCA ====== */}
          {activeTab === "seguranca" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seguranca</CardTitle>
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
                <CardTitle className="text-lg">Idioma e Regiao</CardTitle>
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
                    <option value="pt-BR">Portugues (Brasil)</option>
                    <option value="en">English</option>
                    <option value="es">Espanol</option>
                  </select>
                </div>
                <div>
                  <Label>Fuso horario</Label>
                  <select
                    className="w-full mt-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={langPrefs.timezone}
                    onChange={(e) =>
                      setLangPrefs((prev) => ({ ...prev, timezone: e.target.value }))
                    }
                  >
                    <option value="America/Sao_Paulo">Brasilia (GMT-3)</option>
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
                <CardTitle className="text-lg">Metodos de Pagamento</CardTitle>
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
                    Estamos preparando a integracao com meios de pagamento. Voce sera
                    notificado quando estiver disponivel.
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

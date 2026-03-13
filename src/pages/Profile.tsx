import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Plane,
  FileText,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { dbRoleToUIRole } from "@/lib/roles";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `+${digits}`;
  if (digits.length <= 4) return `+${digits.slice(0, 2)} (${digits.slice(2)}`;
  if (digits.length <= 9)
    return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4)}`;
  return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9, 13)}`;
}

const Profile = () => {
  const { organization, profile, userRole, user, refreshProfile } = useAuth();
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fullName = profile?.full_name || "Usuário";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const uiRoleLabel = userRole ? dbRoleToUIRole(userRole) : null;
  const roleDisplay =
    uiRoleLabel === "viajante"
      ? "Viajante"
      : uiRoleLabel === "anfitriao"
        ? "Anfitrião"
        : userRole ?? "—";

  const handleAvatarUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);
      const url = urlData.publicUrl;
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", profile.id);
      if (error) throw error;
      await refreshProfile();
      toast.success("Foto atualizada!");
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao enviar foto.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const formattedDate = profile?.date_of_birth
    ? new Date(profile.date_of_birth + "T12:00:00").toLocaleDateString("pt-BR")
    : null;

  const infoItems = [
    {
      icon: Mail,
      label: "E-mail",
      value: user?.email,
    },
    {
      icon: Phone,
      label: "Telefone",
      value: profile?.phone ? formatPhone(profile.phone) : null,
    },
    {
      icon: Calendar,
      label: "Data de nascimento",
      value: formattedDate,
    },
    {
      icon: Globe,
      label: "Nacionalidade",
      value: profile?.nationality,
    },
    {
      icon: FileText,
      label: "País do passaporte",
      value: profile?.passport_country,
    },
    {
      icon: Plane,
      label: "Estilo de viagem",
      value: profile?.travel_style,
    },
  ];

  if (organization) {
    infoItems.push(
      {
        icon: MapPin,
        label: "Organização",
        value: organization.name,
      },
      {
        icon: Globe,
        label: "País",
        value: organization.country,
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-sm text-tc-text-secondary mt-1">
            Suas informações pessoais e de conta.
          </p>
        </div>
        <Link to="/settings">
          <Button variant="outline" size="sm">
            Editar Perfil
          </Button>
        </Link>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <label className="relative w-24 h-24 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-2xl font-bold cursor-pointer group overflow-hidden shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>

            {/* Name + role */}
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-tc-text-heading">
                {fullName}
              </h2>
              <Badge
                variant="outline"
                className="mt-1.5 capitalize text-xs"
              >
                {roleDisplay}
              </Badge>
              {profile?.bio && (
                <p className="text-sm text-tc-text-secondary mt-3 max-w-lg">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Grid */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold text-tc-text-heading uppercase tracking-wide mb-4">
            Informações
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
              >
                <item.icon className="w-4 h-4 text-tc-text-hint mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-tc-text-hint">{item.label}</p>
                  <p className="text-sm font-medium text-tc-text-primary">
                    {item.value || (
                      <span className="text-tc-text-hint font-normal">
                        Não informado
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organization description */}
      {organization?.description && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-tc-text-heading uppercase tracking-wide mb-2">
              Sobre a Organização
            </h3>
            <p className="text-sm text-tc-text-secondary leading-relaxed">
              {organization.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;

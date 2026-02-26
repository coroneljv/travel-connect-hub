
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Camera, Globe, Mail, MapPin, Phone } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { uploadFile } from "@/lib/storage"
import { useState, useEffect } from "react"
import { toast } from "sonner"

const Profile = () => {
  const { organization, profile, userRole } = useAuth()
  const [orgName, setOrgName] = useState("")
  const [orgCountry, setOrgCountry] = useState("")
  const [orgDescription, setOrgDescription] = useState("")
  const [orgWebsite, setOrgWebsite] = useState("")
  const [orgEmail, setOrgEmail] = useState("")
  const [orgPhone, setOrgPhone] = useState("")
  const [orgTaxId, setOrgTaxId] = useState("")
  const [fullName, setFullName] = useState("")
  const [position, setPosition] = useState("")
  const [saving, setSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name ?? "")
      setOrgCountry((organization as any).country ?? "")
      setOrgDescription((organization as any).description ?? "")
      setOrgWebsite((organization as any).website ?? "")
      setOrgEmail((organization as any).email ?? "")
      setOrgPhone((organization as any).phone ?? "")
      setOrgTaxId((organization as any).tax_id ?? "")
    }
    if (profile) {
      setFullName(profile.full_name ?? "")
      setPosition(profile.position ?? "")
    }
  }, [organization, profile])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true)
    try {
      if (organization?.id) {
        const { error: orgErr } = await supabase
          .from("organizations")
          .update({
            name: orgName,
            country: orgCountry,
            description: orgDescription,
            website: orgWebsite,
            email: orgEmail,
            phone: orgPhone,
            tax_id: orgTaxId,
          })
          .eq("id", organization.id)
        if (orgErr) throw orgErr
      }

      if (profile?.id) {
        let avatarUrl = profile?.avatar_url ?? null;
        if (avatarFile) {
          const url = await uploadFile(avatarFile, "avatars");
          if (url) avatarUrl = url;
        }

        const { error: profErr } = await supabase
          .from("profiles")
          .update({ full_name: fullName, position, avatar_url: avatarUrl })
          .eq("id", profile.id)
        if (profErr) throw profErr
      }

      toast.success("Profile updated!")
    } catch (error: any) {
      toast.error(error.message || "Failed to save")
    } finally {
      setSaving(false)
    }
  }

  const initials = fullName
    ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?"

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your institutional information and service offerings.</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="personal">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Institutional Data</CardTitle>
              <CardDescription>Basic company information visible to partners.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b">
                <label className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold cursor-pointer group overflow-hidden">
                  {avatarPreview || profile?.avatar_url ? (
                    <img src={avatarPreview || profile?.avatar_url || ""} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
                <div>
                  <p className="font-medium">{orgName || "Your Company"}</p>
                  <Badge variant="outline" className="mt-1 capitalize">{userRole ?? "—"}</Badge>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID</Label>
                  <Input value={orgTaxId} onChange={(e) => setOrgTaxId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" value={orgCountry} onChange={(e) => setOrgCountry(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea className="min-h-[100px]" value={orgDescription} onChange={(e) => setOrgDescription(e.target.value)} />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your individual profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Travel Manager" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Profile

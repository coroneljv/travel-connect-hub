import { useState } from "react";
import { Image, MapPin, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile } from "@/lib/storage";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CreatePostModal({
  open,
  onClose,
}: CreatePostModalProps) {
  const { user, profile } = useAuth();
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      toast.error("Escreva uma legenda para sua publicação");
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      let imageUrl: string | null = null;
      if (photo) {
        imageUrl = await uploadFile(photo, "posts");
      }

      const { error } = await supabase.from("community_posts").insert({
        author_id: user.id,
        content: caption,
        image_url: imageUrl,
        location: location || null,
      });

      if (error) throw error;
      toast.success("Publicação criada com sucesso!");
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar publicação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCaption("");
    setLocation("");
    setPhoto(null);
    setPhotoPreview(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md p-0 rounded-lg overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-bold text-tc-text-primary">
            Criar Nova Publica\u00e7\u00e3o
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm">
              {profile?.full_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-bold text-tc-text-primary">{profile?.full_name || "Usuário"}</p>
              <p className="text-xs text-tc-text-hint">Comunidade</p>
            </div>
          </div>

          {/* Photo upload area */}
          <label className="border-2 border-dashed border-border rounded-lg aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-rose-300 transition-colors bg-gray-50 overflow-hidden relative">
            {photoPreview ? (
              <img src={photoPreview} alt="" className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <>
                <Image className="h-8 w-8 text-tc-text-hint" />
                <p className="text-sm text-tc-text-secondary font-medium">
                  Clique para adicionar uma foto
                </p>
                <p className="text-xs text-tc-text-hint">
                  PNG, JPG, JPEG at\u00e9 10MB
                </p>
              </>
            )}
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </label>

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-tc-text-primary">
              Legenda <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={caption}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  setCaption(e.target.value);
                }
              }}
              placeholder="Compartilhe sua experi\u00eancia com a comunidade... \u2728"
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm text-tc-text-primary placeholder:text-tc-text-hint focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 resize-none"
            />
            <p className="text-xs text-tc-text-hint text-right">
              {caption.length}/500 caracteres
            </p>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-tc-text-primary flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-tc-text-hint" />
              Localiza\u00e7\u00e3o
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Paris, Fran\u00e7a \u{1F1EB}\u{1F1F7}"
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-tc-text-primary placeholder:text-tc-text-hint focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
            />
          </div>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="py-3 rounded-lg border border-border bg-white text-tc-text-primary font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !caption.trim()}
              className="py-3 rounded-lg font-medium text-white bg-navy-500 hover:bg-navy-600 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSubmitting ? "Publicando..." : "Publicar"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

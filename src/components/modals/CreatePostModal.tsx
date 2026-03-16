import { useState, useRef, useEffect } from "react";
import { Image, MapPin, Send, Loader2, X } from "lucide-react";
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
// Popular locations for suggestion
// ---------------------------------------------------------------------------

const POPULAR_LOCATIONS = [
  "Rio de Janeiro, Brasil",
  "São Paulo, Brasil",
  "Florianópolis, Brasil",
  "Salvador, Brasil",
  "Recife, Brasil",
  "Fortaleza, Brasil",
  "Curitiba, Brasil",
  "Belo Horizonte, Brasil",
  "Brasília, Brasil",
  "Porto Alegre, Brasil",
  "Manaus, Brasil",
  "Belém, Brasil",
  "Buenos Aires, Argentina",
  "Santiago, Chile",
  "Lima, Peru",
  "Bogotá, Colômbia",
  "Cidade do México, México",
  "Cancún, México",
  "Havana, Cuba",
  "Paris, França",
  "Londres, Reino Unido",
  "Barcelona, Espanha",
  "Madri, Espanha",
  "Lisboa, Portugal",
  "Porto, Portugal",
  "Roma, Itália",
  "Milão, Itália",
  "Berlim, Alemanha",
  "Amsterdã, Holanda",
  "Praga, República Tcheca",
  "Viena, Áustria",
  "Atenas, Grécia",
  "Istambul, Turquia",
  "Nova York, EUA",
  "Miami, EUA",
  "Los Angeles, EUA",
  "San Francisco, EUA",
  "Toronto, Canadá",
  "Tóquio, Japão",
  "Bangkok, Tailândia",
  "Bali, Indonésia",
  "Sydney, Austrália",
  "Cidade do Cabo, África do Sul",
  "Dubai, Emirados Árabes",
  "Marrakech, Marrocos",
  "Cairo, Egito",
];

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

  // Location suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (value.length >= 2) {
      const query = value.toLowerCase();
      const filtered = POPULAR_LOCATIONS.filter((loc) =>
        loc.toLowerCase().includes(query)
      ).slice(0, 6);
      setFilteredLocations(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectLocation = (loc: string) => {
    setLocation(loc);
    setShowSuggestions(false);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10 MB.");
      return;
    }
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      toast.error("Escreva uma legenda para sua publicação.");
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
      toast.error(error.message || "Erro ao criar publicação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCaption("");
    setLocation("");
    setPhoto(null);
    setPhotoPreview(null);
    setShowSuggestions(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md p-0 rounded-lg overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-bold text-tc-text-primary">
            Criar Nova Publicação
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* User info */}
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold text-sm">
                {profile?.full_name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-tc-text-primary">
                {profile?.full_name || "Usuário"}
              </p>
              <p className="text-xs text-tc-text-hint">Comunidade</p>
            </div>
          </div>

          {/* Photo upload area */}
          <label className="border-2 border-dashed border-border rounded-lg aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-rose-300 transition-colors bg-gray-50 overflow-hidden relative">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt=""
                className="w-full h-full object-cover absolute inset-0"
              />
            ) : (
              <>
                <Image className="h-8 w-8 text-tc-text-hint" />
                <p className="text-sm text-tc-text-secondary font-medium">
                  Clique para adicionar uma foto
                </p>
                <p className="text-xs text-tc-text-hint">
                  PNG, JPG, JPEG até 10 MB
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
              placeholder="Compartilhe sua experiência com a comunidade..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm text-tc-text-primary placeholder:text-tc-text-hint focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 resize-none"
            />
            <p className="text-xs text-tc-text-hint text-right">
              {caption.length}/500 caracteres
            </p>
          </div>

          {/* Location with suggestions */}
          <div className="space-y-2" ref={locationRef}>
            <label className="text-sm font-medium text-tc-text-primary flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-tc-text-hint" />
              Localização
            </label>
            <div className="relative">
              <input
                type="text"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onFocus={() => {
                  if (location.length >= 2 && filteredLocations.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Buscar localização..."
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-white text-sm text-tc-text-primary placeholder:text-tc-text-hint focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500"
              />
              {location && (
                <button
                  type="button"
                  onClick={() => {
                    setLocation("");
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tc-text-hint hover:text-tc-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Suggestions dropdown */}
              {showSuggestions && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => selectLocation(loc)}
                      className="w-full text-left px-4 py-2.5 text-sm text-tc-text-primary hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <MapPin className="h-3.5 w-3.5 text-tc-text-hint shrink-0" />
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
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

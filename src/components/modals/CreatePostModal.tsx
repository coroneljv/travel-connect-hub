import { useState, useRef, useEffect, useCallback } from "react";
import {
  Image,
  MapPin,
  Send,
  Loader2,
  X,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
// Popular locations
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
  "Buenos Aires, Argentina",
  "Santiago, Chile",
  "Lima, Peru",
  "Bogotá, Colômbia",
  "Cidade do México, México",
  "Cancún, México",
  "Paris, França",
  "Londres, Reino Unido",
  "Barcelona, Espanha",
  "Lisboa, Portugal",
  "Roma, Itália",
  "Berlim, Alemanha",
  "Amsterdã, Holanda",
  "Nova York, EUA",
  "Miami, EUA",
  "Tóquio, Japão",
  "Bangkok, Tailândia",
  "Bali, Indonésia",
  "Sydney, Austrália",
  "Dubai, Emirados Árabes",
];

// ---------------------------------------------------------------------------
// Aspect ratio presets
// ---------------------------------------------------------------------------

type AspectPreset = { label: string; ratio: number | null };
const ASPECT_PRESETS: AspectPreset[] = [
  { label: "Original", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "16:9", ratio: 16 / 9 },
];

// ---------------------------------------------------------------------------
// Canvas crop helper
// ---------------------------------------------------------------------------

function cropImageToCanvas(
  img: HTMLImageElement,
  cropArea: { x: number; y: number; w: number; h: number },
  rotation: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas not supported"));

    const sw = cropArea.w * img.naturalWidth;
    const sh = cropArea.h * img.naturalHeight;
    const sx = cropArea.x * img.naturalWidth;
    const sy = cropArea.y * img.naturalHeight;

    // Max output 1920px
    const scale = Math.min(1, 1920 / Math.max(sw, sh));
    canvas.width = Math.round(sw * scale);
    canvas.height = Math.round(sh * scale);

    ctx.save();
    if (rotation) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Blob failed"))),
      "image/jpeg",
      0.9
    );
  });
}

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
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image editing
  const [editing, setEditing] = useState(false);
  const [selectedAspect, setSelectedAspect] = useState<AspectPreset>(ASPECT_PRESETS[0]);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [imgNatural, setImgNatural] = useState({ w: 1, h: 1 });
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, w: 1, h: 1 });
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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

  // Recalculate crop area when aspect changes
  const recalcCrop = useCallback(
    (ratio: number | null, natW: number, natH: number) => {
      if (!ratio) {
        setCropArea({ x: 0, y: 0, w: 1, h: 1 });
        return;
      }
      const imgRatio = natW / natH;
      let w = 1,
        h = 1;
      if (ratio > imgRatio) {
        // crop height
        w = 1;
        h = imgRatio / ratio;
      } else {
        // crop width
        h = 1;
        w = (ratio / imgRatio);
      }
      const x = (1 - w) / 2;
      const y = (1 - h) / 2;
      setCropArea({ x, y, w, h });
    },
    []
  );

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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10 MB.");
      return;
    }
    setOriginalFile(file);
    setFinalBlob(null);
    setCroppedPreview(null);
    setSelectedAspect(ASPECT_PRESETS[0]);
    setRotation(0);
    setZoom(1);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPhotoPreview(url);
      // detect natural dimensions
      const img = new window.Image();
      img.onload = () => {
        setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
        recalcCrop(null, img.naturalWidth, img.naturalHeight);
        setEditing(true);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    if (!photoPreview) return;
    const img = new window.Image();
    img.onload = async () => {
      try {
        const blob = await cropImageToCanvas(img, cropArea, rotation);
        setFinalBlob(blob);
        setCroppedPreview(URL.createObjectURL(blob));
        setEditing(false);
      } catch {
        toast.error("Erro ao processar imagem.");
      }
    };
    img.src = photoPreview;
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
      let imageAspect: number | null = null;

      if (finalBlob || originalFile) {
        const fileToUpload = finalBlob
          ? new File([finalBlob], "post.jpg", { type: "image/jpeg" })
          : originalFile!;
        imageUrl = await uploadFile(fileToUpload, "posts");

        // Calculate aspect ratio of the final image
        if (finalBlob) {
          imageAspect = (cropArea.w * imgNatural.w) / (cropArea.h * imgNatural.h);
        } else {
          imageAspect = imgNatural.w / imgNatural.h;
        }
      }

      const insertData: Record<string, unknown> = {
        author_id: user.id,
        content: caption,
        image_url: imageUrl,
        location: location || null,
      };
      if (imageAspect) insertData.image_aspect = Math.round(imageAspect * 100) / 100;

      const { error } = await supabase.from("community_posts").insert(insertData);
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
    setOriginalFile(null);
    setPhotoPreview(null);
    setCroppedPreview(null);
    setFinalBlob(null);
    setEditing(false);
    setShowSuggestions(false);
    setRotation(0);
    setZoom(1);
    setSelectedAspect(ASPECT_PRESETS[0]);
    onClose();
  };

  const displayPreview = croppedPreview || photoPreview;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg p-0 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-bold text-tc-text-primary">
            {editing ? "Editar Imagem" : "Criar Nova Publicação"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* ====== IMAGE EDITOR VIEW ====== */}
          {editing && photoPreview && (
            <>
              {/* Aspect ratio presets */}
              <div className="flex items-center gap-2 flex-wrap">
                {ASPECT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setSelectedAspect(preset);
                      recalcCrop(preset.ratio, imgNatural.w, imgNatural.h);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedAspect.label === preset.label
                        ? "bg-rose-500 text-white"
                        : "bg-white border border-gray-300 text-tc-text-primary hover:border-gray-400"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Preview with crop overlay */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center"
                   style={{ minHeight: 250 }}>
                <img
                  ref={imgRef}
                  src={photoPreview}
                  alt=""
                  className="max-w-full max-h-[350px] object-contain"
                  style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
                />
                {/* Crop overlay */}
                {selectedAspect.ratio && (
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Top dark */}
                    <div
                      className="absolute bg-black/50"
                      style={{ top: 0, left: 0, right: 0, height: `${cropArea.y * 100}%` }}
                    />
                    {/* Bottom dark */}
                    <div
                      className="absolute bg-black/50"
                      style={{ bottom: 0, left: 0, right: 0, height: `${(1 - cropArea.y - cropArea.h) * 100}%` }}
                    />
                    {/* Left dark */}
                    <div
                      className="absolute bg-black/50"
                      style={{
                        top: `${cropArea.y * 100}%`,
                        left: 0,
                        width: `${cropArea.x * 100}%`,
                        height: `${cropArea.h * 100}%`,
                      }}
                    />
                    {/* Right dark */}
                    <div
                      className="absolute bg-black/50"
                      style={{
                        top: `${cropArea.y * 100}%`,
                        right: 0,
                        width: `${(1 - cropArea.x - cropArea.w) * 100}%`,
                        height: `${cropArea.h * 100}%`,
                      }}
                    />
                    {/* Crop border */}
                    <div
                      className="absolute border-2 border-white/80"
                      style={{
                        top: `${cropArea.y * 100}%`,
                        left: `${cropArea.x * 100}%`,
                        width: `${cropArea.w * 100}%`,
                        height: `${cropArea.h * 100}%`,
                      }}
                    >
                      {/* Grid lines */}
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="border border-white/20" />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-2 rounded-lg border border-border hover:bg-gray-50 transition-colors"
                    title="Girar"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(z + 0.1, 3))}
                    className="p-2 rounded-lg border border-border hover:bg-gray-50 transition-colors"
                    title="Zoom +"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
                    className="p-2 rounded-lg border border-border hover:bg-gray-50 transition-colors"
                    title="Zoom -"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyCrop}
                    className="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-1.5"
                  >
                    <Crop className="h-4 w-4" />
                    Aplicar
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ====== NORMAL POST VIEW ====== */}
          {!editing && (
            <>
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

              {/* Photo area */}
              {displayPreview ? (
                <div className="relative rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={displayPreview}
                    alt=""
                    className="w-full max-h-[300px] object-contain mx-auto"
                  />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      title="Editar imagem"
                    >
                      <Crop className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOriginalFile(null);
                        setPhotoPreview(null);
                        setCroppedPreview(null);
                        setFinalBlob(null);
                      }}
                      className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      title="Remover imagem"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border rounded-lg aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-rose-300 transition-colors bg-gray-50">
                  <Image className="h-8 w-8 text-tc-text-hint" />
                  <p className="text-sm text-tc-text-secondary font-medium">
                    Clique para adicionar uma foto
                  </p>
                  <p className="text-xs text-tc-text-hint">
                    PNG, JPG, JPEG até 10 MB
                  </p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className="hidden"
                    onChange={handlePhotoSelect}
                  />
                </label>
              )}

              {/* Caption */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-tc-text-primary">
                  Legenda <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={caption}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) setCaption(e.target.value);
                  }}
                  placeholder="Compartilhe sua experiência com a comunidade..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-white text-sm text-tc-text-primary placeholder:text-tc-text-hint focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-500 resize-none"
                />
                <p className="text-xs text-tc-text-hint text-right">
                  {caption.length}/500 caracteres
                </p>
              </div>

              {/* Location */}
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
                      if (location.length >= 2 && filteredLocations.length > 0)
                        setShowSuggestions(true);
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
                  {showSuggestions && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setLocation(loc);
                            setShowSuggestions(false);
                          }}
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useRef, useEffect } from "react";
import {
  Image,
  MapPin,
  Send,
  Loader2,
  X,
  Crop,
  RotateCw,
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
  "Paris, França",
  "Londres, Reino Unido",
  "Barcelona, Espanha",
  "Lisboa, Portugal",
  "Roma, Itália",
  "Berlim, Alemanha",
  "Nova York, EUA",
  "Miami, EUA",
  "Tóquio, Japão",
  "Bangkok, Tailândia",
  "Bali, Indonésia",
  "Sydney, Austrália",
  "Dubai, Emirados Árabes",
];

// ---------------------------------------------------------------------------
// Aspect presets — viewport will use these ratios
// ---------------------------------------------------------------------------

type AspectPreset = { label: string; ratio: number | null };
const ASPECT_PRESETS: AspectPreset[] = [
  { label: "Original", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "4:5", ratio: 4 / 5 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "16:9", ratio: 16 / 9 },
];

// ---------------------------------------------------------------------------
// Canvas-based crop: renders the visible portion of the viewport
// ---------------------------------------------------------------------------

function renderCrop(
  imgSrc: string,
  _imgNatural: { w: number; h: number },
  viewportRatio: number, // w/h of the viewport
  offsetPct: { x: number; y: number }, // 0..1 pan offset
  rotation: number
): Promise<{ blob: Blob; aspect: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      const imgRatio = nw / nh;

      let sx: number, sy: number, sw: number, sh: number;

      if (viewportRatio > imgRatio) {
        // Image taller than viewport — crop top/bottom
        sw = nw;
        sh = nw / viewportRatio;
        sx = 0;
        const maxOffset = nh - sh;
        sy = maxOffset * offsetPct.y;
      } else {
        // Image wider than viewport — crop left/right
        sh = nh;
        sw = nh * viewportRatio;
        sy = 0;
        const maxOffset = nw - sw;
        sx = maxOffset * offsetPct.x;
      }

      const scale = Math.min(1, 1920 / Math.max(sw, sh));
      const canvas = document.createElement("canvas");

      if (rotation === 90 || rotation === 270) {
        canvas.width = Math.round(sh * scale);
        canvas.height = Math.round(sw * scale);
      } else {
        canvas.width = Math.round(sw * scale);
        canvas.height = Math.round(sh * scale);
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas"));

      ctx.save();
      if (rotation) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        if (rotation === 90 || rotation === 270) {
          ctx.translate(-canvas.height / 2, -canvas.width / 2);
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, Math.round(sh * scale), Math.round(sw * scale));
        } else {
          ctx.translate(-canvas.width / 2, -canvas.height / 2);
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        }
      } else {
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      }
      ctx.restore();

      canvas.toBlob(
        (blob) =>
          blob
            ? resolve({ blob, aspect: canvas.width / canvas.height })
            : reject(new Error("Blob failed")),
        "image/jpeg",
        0.92
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = imgSrc;
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
// ImageEditor — Instagram-style crop
// ---------------------------------------------------------------------------

function ImageEditor({
  src,
  imgNatural,
  onApply,
  onCancel,
}: {
  src: string;
  imgNatural: { w: number; h: number };
  onApply: (blob: Blob, aspect: number) => void;
  onCancel: () => void;
}) {
  const [selectedAspect, setSelectedAspect] = useState<AspectPreset>(
    ASPECT_PRESETS[0]
  );
  const [rotation, setRotation] = useState(0);
  const [offsetPct, setOffsetPct] = useState({ x: 0.5, y: 0.5 });
  const [applying, setApplying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const imgRatio = imgNatural.w / imgNatural.h;
  const viewportRatio = selectedAspect.ratio ?? imgRatio;

  // Reset offset when aspect changes
  useEffect(() => {
    setOffsetPct({ x: 0.5, y: 0.5 });
  }, [selectedAspect]);

  // Determine which axis can be panned
  const canPanX = viewportRatio < imgRatio;
  const canPanY = viewportRatio > imgRatio;

  // Mouse/touch drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    setOffsetPct((prev) => ({
      x: canPanX
        ? Math.max(0, Math.min(1, prev.x - dx / rect.width))
        : prev.x,
      y: canPanY
        ? Math.max(0, Math.min(1, prev.y - dy / rect.height))
        : prev.y,
    }));
  };

  const handlePointerUp = () => {
    dragging.current = false;
  };

  // Calculate CSS object-position for the preview
  const objectPosition = `${offsetPct.x * 100}% ${offsetPct.y * 100}%`;

  // Viewport container aspect ratio via padding-bottom trick
  const viewportPaddingBottom = `${(1 / viewportRatio) * 100}%`;

  const handleApply = async () => {
    setApplying(true);
    try {
      const { blob, aspect } = await renderCrop(
        src,
        imgNatural,
        viewportRatio,
        offsetPct,
        rotation
      );
      onApply(blob, aspect);
    } catch {
      toast.error("Erro ao processar imagem.");
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Aspect presets */}
      <div className="flex items-center gap-2 flex-wrap">
        {ASPECT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => setSelectedAspect(preset)}
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

      {/* Viewport — shows image cropped to selected ratio */}
      <div
        ref={containerRef}
        className="relative rounded-lg overflow-hidden bg-gray-900 cursor-grab active:cursor-grabbing select-none"
        style={{ paddingBottom: viewportPaddingBottom }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full"
          style={{
            objectFit: "cover",
            objectPosition,
            transform: `rotate(${rotation}deg)`,
          }}
        />
        {/* Rule of thirds grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/25" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/25" />
          <div className="absolute top-1/3 left-0 right-0 h-px bg-white/25" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-white/25" />
        </div>
        {/* Drag hint */}
        {(canPanX || canPanY) && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none">
            Arraste para ajustar
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="p-2 rounded-lg border border-border hover:bg-gray-50 transition-colors"
          title="Girar 90°"
        >
          <RotateCw className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            className="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {applying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Crop className="h-4 w-4" />
            )}
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CreatePostModal({
  open,
  onClose,
}: CreatePostModalProps) {
  const { user, profile } = useAuth();
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [imgNatural, setImgNatural] = useState({ w: 1, h: 1 });
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null);
  const [finalAspect, setFinalAspect] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  // Location suggestions
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(e.target as Node)
      ) {
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

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10 MB.");
      return;
    }
    setFinalBlob(null);
    setCroppedPreview(null);
    setFinalAspect(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setPhotoSrc(url);
      const img = new window.Image();
      img.onload = () => {
        setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
        setEditing(true);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = (blob: Blob, aspect: number) => {
    setFinalBlob(blob);
    setCroppedPreview(URL.createObjectURL(blob));
    setFinalAspect(aspect);
    setEditing(false);
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

      if (finalBlob) {
        const file = new File([finalBlob], "post.jpg", { type: "image/jpeg" });
        imageUrl = await uploadFile(file, "posts");
      } else if (photoSrc) {
        // No crop applied — upload original
        const resp = await fetch(photoSrc);
        const blob = await resp.blob();
        const file = new File([blob], "post.jpg", { type: blob.type });
        imageUrl = await uploadFile(file, "posts");
      }

      const aspect = finalAspect ?? (photoSrc ? imgNatural.w / imgNatural.h : null);

      const { data: inserted, error } = await supabase
        .from("community_posts")
        .insert({
          author_id: user.id,
          content: caption,
          image_url: imageUrl,
          location: location || null,
        })
        .select("id")
        .single();

      // Save image_aspect (column not in generated types yet)
      if (!error && inserted && imageUrl && aspect) {
        await (supabase.from("community_posts") as any)
          .update({ image_aspect: Math.round(aspect * 100) / 100 })
          .eq("id", inserted.id);
      }
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
    setPhotoSrc(null);
    setCroppedPreview(null);
    setFinalBlob(null);
    setFinalAspect(null);
    setEditing(false);
    setShowSuggestions(false);
    onClose();
  };

  const displayPreview = croppedPreview || photoSrc;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg p-0 rounded-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-bold text-tc-text-primary">
            {editing ? "Editar Imagem" : "Criar Nova Publicação"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* ====== IMAGE EDITOR ====== */}
          {editing && photoSrc && (
            <ImageEditor
              src={photoSrc}
              imgNatural={imgNatural}
              onApply={handleApplyCrop}
              onCancel={() => setEditing(false)}
            />
          )}

          {/* ====== POST FORM ====== */}
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

              {/* Photo preview */}
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
                        setPhotoSrc(null);
                        setCroppedPreview(null);
                        setFinalBlob(null);
                        setFinalAspect(null);
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
                      if (
                        location.length >= 2 &&
                        filteredLocations.length > 0
                      )
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

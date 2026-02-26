import { useState } from "react";
import { Image, MapPin, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");

  const handleClose = () => {
    setCaption("");
    setLocation("");
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
              L
            </div>
            <div>
              <p className="text-sm font-bold text-tc-text-primary">Luciane</p>
              <p className="text-xs text-tc-text-hint">Viajante</p>
            </div>
          </div>

          {/* Photo upload area */}
          <div className="border-2 border-dashed border-border rounded-lg aspect-video flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-rose-300 transition-colors bg-gray-50">
            <Image className="h-8 w-8 text-tc-text-hint" />
            <p className="text-sm text-tc-text-secondary font-medium">
              Clique para adicionar uma foto
            </p>
            <p className="text-xs text-tc-text-hint">
              PNG, JPG, JPEG at\u00e9 10MB
            </p>
          </div>

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
              className="py-3 rounded-lg font-medium text-white bg-navy-500 hover:bg-navy-600 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              Publicar
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

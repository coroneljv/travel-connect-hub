import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = [
  {
    label: "Frequentes",
    emojis: ["😊", "😂", "❤️", "👍", "🙏", "😍", "🔥", "✨", "🎉", "💪"],
  },
  {
    label: "Rostos",
    emojis: ["😀", "😃", "😄", "😁", "😆", "🥹", "😅", "🤣", "🥰", "😇", "🙂", "😉", "😌", "😎", "🤩", "🥳", "😏", "😒", "😔", "😢"],
  },
  {
    label: "Gestos",
    emojis: ["👋", "🤚", "✋", "🖐️", "👌", "🤌", "✌️", "🤞", "🫶", "👏", "🙌", "👐", "🤲", "🫡", "💅", "🤝"],
  },
  {
    label: "Viagem",
    emojis: ["✈️", "🌍", "🏖️", "🏔️", "🗺️", "🧳", "🚀", "🌅", "🏕️", "🛶", "🎒", "📸", "🌴", "🏄", "⛺", "🚢"],
  },
];

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 text-tc-text-hint hover:text-tc-text-secondary transition-colors"
      >
        <Smile className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute bottom-12 right-0 w-72 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto p-3 space-y-3">
            {EMOJI_CATEGORIES.map((cat) => (
              <div key={cat.label}>
                <p className="text-xs font-medium text-tc-text-hint mb-1.5">
                  {cat.label}
                </p>
                <div className="flex flex-wrap gap-1">
                  {cat.emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        onSelect(emoji);
                        setOpen(false);
                      }}
                      className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

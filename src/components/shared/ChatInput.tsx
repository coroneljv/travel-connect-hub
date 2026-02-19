import { useRef } from "react";
import { Paperclip, Image as ImageIcon } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileSelect?: (file: File) => void;
  onImageSelect?: (file: File) => void;
  placeholder?: string;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onFileSelect,
  onImageSelect,
  placeholder = "Digite uma mensagem...",
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    onChange(value + emoji);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onFileSelect?.(file);
    e.target.value = "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onImageSelect?.(file);
    e.target.value = "";
  };

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.zip"
        onChange={handleFileChange}
      />
      <input
        ref={imageInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* Input bar */}
      <div className="flex items-center gap-2 px-6 py-3 border-t border-border shrink-0 bg-white">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-tc-text-hint hover:text-tc-text-secondary transition-colors"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-tc-chat-input rounded-pill px-4 py-2.5 text-sm placeholder:text-tc-text-hint outline-none"
        />
        <EmojiPicker onSelect={handleEmojiSelect} />
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="p-2 text-tc-text-hint hover:text-tc-text-secondary transition-colors"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
      </div>
    </>
  );
}

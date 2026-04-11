import { useState } from "react";
import i18n from "@/i18n";

const LANGUAGES = [
  {
    code: "pt-BR",
    flag: "🇧🇷",
    label: "Português (Brasil)",
    nativeLabel: "Português (Brasil)",
  },
  {
    code: "en",
    flag: "🇺🇸",
    label: "English",
    nativeLabel: "English",
  },
  {
    code: "es",
    flag: "🇪🇸",
    label: "Español",
    nativeLabel: "Español",
  },
];

interface Props {
  onSelect: (code: string) => void;
}

export default function LanguageSelectionModal({ onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSelect(code: string) {
    setSelected(code);
  }

  function handleConfirm() {
    if (!selected) return;
    i18n.changeLanguage(selected);
    try {
      const existing = JSON.parse(localStorage.getItem("tc_lang_prefs") ?? "{}");
      localStorage.setItem(
        "tc_lang_prefs",
        JSON.stringify({ ...existing, language: selected }),
      );
    } catch {
      localStorage.setItem("tc_lang_prefs", JSON.stringify({ language: selected }));
    }
    localStorage.setItem("tc_lang_selected", "true");
    onSelect(selected);
  }

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header stripe */}
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(to right, #364763, #cf3952)" }}
        />

        {/* Body */}
        <div className="px-8 py-8 flex flex-col items-center text-center">

          {/* Logo / icon */}
          <img
            src="/images/logo-travel-connect.svg"
            alt="Travel Connect"
            style={{ height: 56, width: "auto", transform: "scaleY(-1)", marginBottom: 24 }}
          />

          {/* Triple-language question */}
          <div className="space-y-1 mb-8">
            <p className="text-[15px] font-semibold text-[#1e2939]">
              What is your preferred language?
            </p>
            <p className="text-[15px] font-semibold text-[#1e2939]">
              ¿Cuál es tu idioma de preferencia?
            </p>
            <p className="text-[15px] font-semibold text-[#1e2939]">
              Qual é o seu idioma de preferência?
            </p>
          </div>

          {/* Language options */}
          <div className="flex flex-col gap-3 w-full">
            {LANGUAGES.map((lang) => {
              const isSelected = selected === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`flex items-center gap-4 w-full px-5 py-4 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? "border-[#364763] bg-[rgba(54,71,99,0.06)]"
                      : "border-[#dbdbdb] bg-white hover:border-[#364763]/40 hover:bg-[rgba(54,71,99,0.03)]"
                  }`}
                >
                  <span className="text-2xl leading-none">{lang.flag}</span>
                  <span
                    className={`text-[15px] font-medium ${
                      isSelected ? "text-[#364763]" : "text-[#3f444c]"
                    }`}
                  >
                    {lang.nativeLabel}
                  </span>
                  {isSelected && (
                    <span className="ml-auto h-5 w-5 rounded-full bg-[#364763] flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 12 10" className="w-3 h-3 fill-white">
                        <path d="M1 5l3 3 7-7" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={!selected}
            className="mt-6 w-full h-[46px] rounded-xl text-[15px] font-medium text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={
              selected
                ? { background: "linear-gradient(to right, #364763, #cf3952)" }
                : { background: "#9ca3af" }
            }
          >
            {selected === "en" && "Continue"}
            {selected === "es" && "Continuar"}
            {selected === "pt-BR" && "Continuar"}
            {!selected && "—"}
          </button>
        </div>
      </div>
    </div>
  );
}

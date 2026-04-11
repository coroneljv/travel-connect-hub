import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ptBR from "./locales/pt-BR.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

// Read persisted language preference (same key used by Settings.tsx)
function getSavedLanguage(): string {
  try {
    const raw = localStorage.getItem("tc_lang_prefs");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.language) return parsed.language;
    }
  } catch {
    // ignore
  }
  return "pt-BR";
}

i18n.use(initReactI18next).init({
  resources: {
    "pt-BR": { translation: ptBR },
    en:      { translation: en },
    es:      { translation: es },
  },
  lng: getSavedLanguage(),
  fallbackLng: "pt-BR",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

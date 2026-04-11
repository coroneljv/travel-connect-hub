import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { dbRoleToUIRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n";

const LANG_OPTIONS = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en",    label: "English",   flag: "🇺🇸" },
  { code: "es",    label: "Español",   flag: "🇪🇸" },
];

export function TopNavbar() {
  const { t } = useTranslation();
  const { profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const uiRole = userRole ? dbRoleToUIRole(userRole) : null;

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const currentLang = LANG_OPTIONS.find((l) => l.code === i18n.language)
    ?? LANG_OPTIONS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function changeLang(code: string) {
    i18n.changeLanguage(code);
    // Persist to localStorage so Settings page and next boot pick it up
    try {
      const existing = JSON.parse(localStorage.getItem("tc_lang_prefs") ?? "{}");
      localStorage.setItem("tc_lang_prefs", JSON.stringify({ ...existing, language: code }));
    } catch {
      localStorage.setItem("tc_lang_prefs", JSON.stringify({ language: code }));
    }
    setLangOpen(false);
  }

  const NAV_ITEMS = [
    { label: t("nav.home"),          path: "/dashboard" },
    { label: t("nav.opportunities"), viajante: "/opportunities", anfitriao: "/anfitriao/oportunidades" },
    { label: t("nav.applications"),  path: "/applications" },
    { label: t("nav.academy"),       path: "/academy" },
    { label: t("nav.reviews"),       path: "/reviews" },
    { label: t("nav.community"),     path: "/community" },
  ];

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="h-20 bg-navy-500 sticky top-0 z-50 flex items-center px-6 gap-4">
      {/* Logo */}
      <div className="shrink-0 flex items-center justify-center">
        <Logo size="sm" showText={false} color="white" />
      </div>

      {/* Nav Links */}
      <nav className="hidden md:flex items-center gap-8 flex-1 h-full overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const path =
            "path" in item && item.path
              ? item.path
              : uiRole === "anfitriao"
                ? (item as any).anfitriao
                : (item as any).viajante;
          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex-1 flex items-center justify-center px-4 py-1 text-base font-normal text-white text-center transition-opacity ${
                  isActive ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Right side: credits + lang + avatar */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Credits badge */}
        <Link
          to="/credits"
          className="flex items-center gap-1.5 h-[37px] px-[7px] py-px rounded-md border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <Zap className="h-5 w-5" />
          <span className="text-xs font-medium">5</span>
        </Link>

        {/* Language selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-1.5 h-[37px] px-[7px] py-px rounded-md border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <span className="text-lg leading-none">{currentLang.flag}</span>
            <ChevronDown
              className={`h-4 w-4 text-white transition-transform ${langOpen ? "rotate-180" : ""}`}
            />
          </button>

          {langOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-white/20 bg-[#2D3A4A] shadow-xl overflow-hidden z-50">
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  onClick={() => changeLang(opt.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors ${
                    opt.code === i18n.language
                      ? "bg-white/20 text-white font-medium"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <span className="text-base">{opt.flag}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2.5 h-full"
        >
          <Avatar className="h-[60px] w-[60px]">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-navy-400 text-white text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}

import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { dbRoleToUIRole } from "@/lib/roles";

const BASE_NAV = [
  { label: "Início", path: "/dashboard" },
  { label: "Oportunidades", viajante: "/opportunities", anfitriao: "/anfitriao/oportunidades" },
  { label: "Candidaturas", path: "/applications" },
  { label: "Academy", path: "/academy" },
  { label: "Avaliações", path: "/reviews" },
  { label: "Comunidade", path: "/community" },
];

export function TopNavbar() {
  const { profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const uiRole = userRole ? dbRoleToUIRole(userRole) : null;

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
        {BASE_NAV.map((item) => {
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
        <button className="flex items-center gap-1.5 h-[37px] px-[7px] py-px rounded-md border border-white/30 bg-white/10 text-white">
          <Zap className="h-5 w-5" />
          <span className="text-xs font-medium">5</span>
        </button>

        {/* Language selector */}
        <div className="flex items-center gap-1.5 h-[37px] px-[7px] py-px rounded-md border border-white/30 bg-white/10">
          <span className="text-lg">🇧🇷</span>
          <ChevronDown className="h-4 w-4 text-white" />
        </div>

        {/* Avatar + dropdown */}
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

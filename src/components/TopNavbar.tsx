import { NavLink, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, Bell, MessageSquare, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { dbRoleToUIRole, ROLE_CONFIG } from "@/lib/roles";

const navItems = [
  { label: "Início", path: "/dashboard" },
  { label: "Oportunidades", path: "/opportunities" },
  { label: "Candidaturas", path: "/applications" },
  { label: "Academy", path: "/academy" },
  { label: "Avaliações", path: "/reviews" },
  { label: "Comunidade", path: "/community" },
];

export function TopNavbar() {
  const { profile, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const uiRole = userRole ? dbRoleToUIRole(userRole) : null;

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto h-full flex items-center px-6">
        {/* Logo */}
        <div className="mr-8 flex-shrink-0">
          <Logo size="sm" showText={false} />
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-5 text-sm font-medium transition-colors relative ${
                  isActive
                    ? "text-navy-500 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-rose-500"
                    : "text-muted-foreground hover:text-navy-500"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>5</span>
          </Button>

          {uiRole && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                uiRole === "viajante"
                  ? "bg-navy-500 text-white"
                  : "bg-rose-500 text-white"
              }`}
            >
              {ROLE_CONFIG[uiRole].label}
            </span>
          )}

          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>

          <Avatar className="h-9 w-9 ml-1">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-navy-100 text-navy-600 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

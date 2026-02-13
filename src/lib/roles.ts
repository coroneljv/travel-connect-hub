import type { AppRole } from "@/types/database";

export type UIRole = "viajante" | "anfitriao";

export const ROLE_CONFIG = {
  viajante: {
    dbRole: "supplier" as AppRole,
    label: "Viajante",
    description: "Explore o mundo e encontre experiências autênticas",
    color: "navy" as const,
    bgClass: "bg-navy-500",
    hoverBgClass: "hover:bg-navy-600",
    textClass: "text-white",
    badgeClass: "bg-navy-500 text-white",
  },
  anfitriao: {
    dbRole: "buyer" as AppRole,
    label: "Anfitrião",
    description: "Compartilhe seu espaço e receba viajantes incríveis",
    color: "rose" as const,
    bgClass: "bg-rose-500",
    hoverBgClass: "hover:bg-rose-600",
    textClass: "text-white",
    badgeClass: "bg-rose-500 text-white",
  },
} as const;

export function dbRoleToUIRole(dbRole: AppRole): UIRole | null {
  if (dbRole === "supplier") return "viajante";
  if (dbRole === "buyer") return "anfitriao";
  return null;
}

export function uiRoleToDbRole(uiRole: UIRole): AppRole {
  return ROLE_CONFIG[uiRole].dbRole;
}

export function getRoleConfig(uiRole: UIRole) {
  return ROLE_CONFIG[uiRole];
}

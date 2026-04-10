import { Zap, Star, TrendingUp, Crown } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Plan {
  id: string;
  name: string;
  icon: LucideIcon;
  credits: number;
  pricePerCredit: string;
  totalPrice: string;
  paymentType: string;
  validity: string;
  isPopular?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    credits: 5,
    pricePerCredit: "R$ 9,98 por crédito",
    totalPrice: "R$ 49,90",
    paymentType: "pagamento único",
    validity: "Válido por 90 dias",
  },
  {
    id: "professional",
    name: "Professional",
    icon: Star,
    credits: 15,
    pricePerCredit: "R$ 7,99 por crédito",
    totalPrice: "R$ 119,90",
    paymentType: "pagamento único",
    validity: "Válido por 180 dias",
    isPopular: true,
  },
  {
    id: "business",
    name: "Business",
    icon: TrendingUp,
    credits: 30,
    pricePerCredit: "R$ 6,66 por crédito",
    totalPrice: "R$ 199,90",
    paymentType: "pagamento único",
    validity: "Válido por 365 dias",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Crown,
    credits: 100,
    pricePerCredit: "R$ 4,99 por crédito",
    totalPrice: "R$ 499,90",
    paymentType: "",
    validity: "Créditos Nunca Expiram",
  },
];

export const PLAN_MAP: Record<string, Plan> = Object.fromEntries(
  PLANS.map((p) => [p.id, p]),
);

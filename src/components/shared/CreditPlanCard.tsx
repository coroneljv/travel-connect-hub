import type { LucideIcon } from "lucide-react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface CreditPlan {
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

interface CreditPlanCardProps {
  plan: CreditPlan;
  onPurchase: (planId: string) => void;
  isLoading?: boolean;
}

export default function CreditPlanCard({
  plan,
  onPurchase,
  isLoading = false,
}: CreditPlanCardProps) {
  const Icon = plan.icon;
  const isPopular = plan.isPopular ?? false;

  return (
    <Card
      className={`relative flex flex-col ${
        isPopular
          ? "border-rose-500 border-2 shadow-lg"
          : "border-border"
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute -top-px left-0 right-0 flex justify-center">
          <span className="inline-flex items-center gap-1 bg-rose-500 text-white text-xs font-medium px-4 py-1.5 rounded-b-lg">
            <Star className="h-3 w-3 fill-white" />
            Mais Popular
          </span>
        </div>
      )}

      <CardContent className={`p-6 flex flex-col items-center text-center flex-1 ${isPopular ? "pt-10" : ""}`}>
        {/* Icon */}
        <div
          className={`h-14 w-14 rounded-xl flex items-center justify-center mb-4 ${
            isPopular ? "bg-rose-50" : "bg-navy-50"
          }`}
        >
          <Icon
            className={`h-6 w-6 ${
              isPopular ? "text-rose-500" : "text-navy-500"
            }`}
          />
        </div>

        {/* Name */}
        <h3 className="text-base font-semibold text-tc-text-primary">
          {plan.name}
        </h3>
        <p className="text-xs text-tc-text-hint mt-0.5">
          {plan.credits} Host Crédits
        </p>

        {/* Star + credits count */}
        <div className="flex items-center gap-1 mt-3">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          <span className="text-2xl font-bold text-tc-text-primary">
            {plan.credits}
          </span>
        </div>

        {/* Pricing */}
        <p className="text-xs text-tc-text-hint mt-3">{plan.pricePerCredit}</p>
        <p className="text-xl font-bold text-tc-text-primary mt-1">
          {plan.totalPrice}
        </p>
        <p className="text-xs text-tc-text-hint mt-1">{plan.paymentType}</p>
        <p className="text-xs text-tc-text-secondary mt-0.5">
          {plan.validity}
        </p>

        {/* CTA */}
        <div className="mt-auto pt-5 w-full">
          <Button
            className={`w-full ${
              isPopular
                ? "bg-rose-500 hover:bg-rose-600 text-white"
                : "bg-white hover:bg-muted text-tc-text-primary border border-border"
            }`}
            onClick={() => onPurchase(plan.id)}
            disabled={isLoading}
          >
            {isLoading ? "Redirecionando..." : "Comprar Agora"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

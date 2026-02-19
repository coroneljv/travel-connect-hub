import { Zap, Star, TrendingUp, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import CreditPlanCard from "@/components/shared/CreditPlanCard";
import type { CreditPlan } from "@/components/shared/CreditPlanCard";

/* ── Mock data — TODO: substituir por query Supabase ── */

const PLANS: CreditPlan[] = [
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
    validity: "Crédito Nunca Expiram",
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Compre Host Credits",
    description: "Escolha o pacote ideal para suas necessidades",
  },
  {
    step: 2,
    title: "Publique Vagas",
    description: "Cada vaga publicada consome 1 Host Credit",
  },
  {
    step: 3,
    title: "Receba Candidaturas",
    description: "Viajantes qualificados se candidatam às suas vagas",
  },
];

const FAQ = [
  {
    question: "Os Host Credits expiram?",
    answer: "Sim, exceto no plano Enterprise.",
  },
  {
    question: "Posso cancelar uma vaga?",
    answer: "Sim, mas o Host Credit não é devolvido após a publicação.",
  },
];

/* ── Page ── */

export default function Credits() {
  const handlePurchase = (planId: string) => {
    // TODO: integrar com gateway de pagamento via Supabase / n8n
    const plan = PLANS.find((p) => p.id === planId);
    toast.success(`Redirecionando para pagamento: ${plan?.name ?? planId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-tc-text-primary">
          Loja de Créditos
        </h1>
        <p className="text-sm text-tc-text-hint">
          Use Créditos para cadastrar suas oportunidades na plataforma!
        </p>
      </div>

      {/* Info banner */}
      <Card>
        <CardContent className="py-6 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-xs font-medium px-4 py-1.5 rounded-pill">
            <Zap className="h-3.5 w-3.5" />
            1 Host Credits = 1 Publicação de Vaga
          </span>
          <h2 className="text-base font-semibold text-tc-text-primary mt-3">
            Escolha o Melhor Plano para Você
          </h2>
          <p className="text-sm text-tc-text-hint mt-1 max-w-lg">
            Publique vagas de trabalho e receba candidaturas de viajantes
            qualificados do mundo todo
          </p>
        </CardContent>
      </Card>

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <CreditPlanCard
            key={plan.id}
            plan={plan}
            onPurchase={handlePurchase}
          />
        ))}
      </div>

      {/* Bottom section: How it works + FAQ */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* How it works */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-tc-text-primary mb-4">
              Como Funciona?
            </h3>
            <div className="space-y-4">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-rose-50 text-rose-500 text-xs font-bold shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-tc-text-primary">
                      {item.title}
                    </p>
                    <p className="text-xs text-tc-text-hint">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-tc-text-primary mb-4">
              Dúvidas Frequentes
            </h3>
            <div className="space-y-4">
              {FAQ.map((item) => (
                <div key={item.question}>
                  <p className="text-sm font-medium text-tc-text-primary">
                    {item.question}
                  </p>
                  <p className="text-xs text-tc-text-hint mt-0.5">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

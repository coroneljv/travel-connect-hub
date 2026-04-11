import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Zap, Star, TrendingUp, Crown, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import CreditPlanCard from "@/components/shared/CreditPlanCard";
import type { CreditPlan } from "@/components/shared/CreditPlanCard";

/* ── Planos — valores em centavos ── */

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
    validity: "Créditos Nunca Expiram",
  },
];


/* ── Page ── */

export default function Credits() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const HOW_IT_WORKS = [
    { step: 1, title: t("credits.howItWorks.step1Title"), description: t("credits.howItWorks.step1Desc") },
    { step: 2, title: t("credits.howItWorks.step2Title"), description: t("credits.howItWorks.step2Desc") },
    { step: 3, title: t("credits.howItWorks.step3Title"), description: t("credits.howItWorks.step3Desc") },
  ];

  const FAQ = [
    { question: t("credits.faq.q1"), answer: t("credits.faq.a1") },
    { question: t("credits.faq.q2"), answer: t("credits.faq.a2") },
    { question: t("credits.faq.q3"), answer: t("credits.faq.a3") },
  ];

  /* Trata retorno do Stripe */
  useEffect(() => {
    const success  = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    const plan     = searchParams.get("plan");

    if (success === "true") {
      const planName = PLANS.find((p) => p.id === plan)?.name ?? "selecionado";
      toast.success(`Pagamento confirmado! Plano ${planName} ativado com sucesso.`);
      setSearchParams({}, { replace: true });
    } else if (canceled === "true") {
      toast.error("Pagamento cancelado. Você pode tentar novamente quando quiser.");
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handlePurchase = (planId: string) => {
    navigate(`/checkout/${planId}`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-tc-text-primary">
          {t("credits.title")}
        </h1>
        <p className="text-sm text-tc-text-hint">
          {t("credits.subtitle")}
        </p>
      </div>

      {/* Banner de retorno do Stripe */}
      {searchParams.get("success") === "true" && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-[10px] p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">
            {t("credits.paymentSuccess")}
          </p>
        </div>
      )}
      {searchParams.get("canceled") === "true" && (
        <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-[10px] p-4">
          <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
          <p className="text-sm text-rose-600 font-medium">
            {t("credits.paymentCanceled")}
          </p>
        </div>
      )}

      {/* Info banner */}
      <Card>
        <CardContent className="py-6 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-xs font-medium px-4 py-1.5 rounded-full">
            <Zap className="h-3.5 w-3.5" />
            {t("credits.badge")}
          </span>
          <h2 className="text-base font-semibold text-tc-text-primary mt-3">
            {t("credits.choosePlan")}
          </h2>
          <p className="text-sm text-tc-text-hint mt-1 max-w-lg">
            {t("credits.choosePlanDesc")}
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

      {/* Segurança Stripe */}
      <div className="flex items-center justify-center gap-2 text-xs text-tc-text-hint">
        <svg viewBox="0 0 60 25" className="h-5 opacity-50" fill="currentColor">
          <path d="M59.64 14.28h-8.06v-1.87h8.06v1.87zm-10.2 5.35h-5.83l-1.42-2.77-1.41 2.77h-5.84l4.3-7.64-4.3-7.63h5.84l1.41 2.76 1.42-2.76h5.83l-4.3 7.63 4.3 7.64zM0 3.33h5.47l3.24 12.23L12 3.33h5.47l-6.35 21.34H5.65L0 3.33z"/>
        </svg>
        <span>{t("credits.stripeSecurity")}</span>
      </div>

      {/* Bottom section */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* How it works */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-tc-text-primary mb-4">
              {t("credits.howItWorks.title")}
            </h3>
            <div className="space-y-4">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-rose-50 text-rose-500 text-xs font-bold shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-tc-text-primary">{item.title}</p>
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
              {t("credits.faq.title")}
            </h3>
            <div className="space-y-4">
              {FAQ.map((item) => (
                <div key={item.question}>
                  <p className="text-sm font-medium text-tc-text-primary">{item.question}</p>
                  <p className="text-xs text-tc-text-hint mt-0.5">{item.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

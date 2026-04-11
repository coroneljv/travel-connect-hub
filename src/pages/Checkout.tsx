import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Lock, ChevronLeft, CreditCard, Shield, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PLAN_MAP } from "@/lib/plans";
import { useTranslation } from "react-i18next";

/* ─── Helpers de formatação ─── */

function fmtCardNumber(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function fmtExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function detectBrand(num: string): "visa" | "mastercard" | "amex" | "other" {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  return "other";
}

/* ─── Card brand badge ─── */
function CardBrandIcon({ brand }: { brand: ReturnType<typeof detectBrand> }) {
  if (brand === "visa")
    return (
      <span className="text-[10px] font-black italic text-[#1a1f71] bg-white px-1.5 py-0.5 rounded border border-[#dbdbdb]">
        VISA
      </span>
    );
  if (brand === "mastercard")
    return (
      <span className="flex items-center">
        <span className="h-5 w-5 rounded-full bg-[#eb001b] -mr-2.5 opacity-90" />
        <span className="h-5 w-5 rounded-full bg-[#f79e1b] opacity-90" />
      </span>
    );
  if (brand === "amex")
    return (
      <span className="text-[10px] font-black text-white bg-[#007bc1] px-1.5 py-0.5 rounded">
        AMEX
      </span>
    );
  return <CreditCard className="h-5 w-5 text-[#9c9c9c]" />;
}

/* ─── Input genérico ─── */
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[13px] font-medium text-[#364153]">{label}</label>
        {hint && <span className="text-[11px] text-[#9c9c9c]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-[50px] px-4 bg-[#f3f3f3] border border-[#dbdbdb] rounded-[10px] text-[14px] text-[#12100f] placeholder:text-[#9c9c9c] focus:outline-none focus:ring-2 focus:ring-[#364763]/40 focus:border-[#364763] transition-colors";

/* ─── Page ─── */
export default function Checkout() {
  const { t } = useTranslation();
  const { planId } = useParams<{ planId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const plan = planId ? PLAN_MAP[planId] : undefined;

  const [form, setForm] = useState({
    email: user?.email ?? "",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cpf: "",
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "processing">("form");

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#4a5565] mb-4">{t("checkout.planNotFound")}.</p>
          <Link to="/credits" className="text-[#cf3952] hover:underline text-sm">
            {t("checkout.backToCreditsStore")}
          </Link>
        </div>
      </div>
    );
  }

  const PlanIcon = plan.icon;
  const brand = detectBrand(form.cardNumber);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações básicas
    const digits = form.cardNumber.replace(/\s/g, "");
    if (digits.length < 13) {
      toast.error("Número de cartão inválido.");
      return;
    }
    const [month, year] = form.expiry.split("/");
    if (!month || !year || parseInt(month) > 12) {
      toast.error("Data de validade inválida.");
      return;
    }

    setLoading(true);
    setStep("processing");

    try {
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        { body: { planId: plan.id, userId: user?.id } },
      );

      if (error) throw error;
      if (!data?.url) throw new Error("URL de checkout não recebida");

      window.location.href = data.url;
    } catch (err: any) {
      toast.error(
        err.message?.includes("STRIPE_SECRET_KEY")
          ? "Integração Stripe ainda não configurada. Adicione as API keys."
          : (err.message ?? "Erro ao processar pagamento. Tente novamente."),
      );
      setLoading(false);
      setStep("form");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      {/* Top bar */}
      <div className="bg-[#364763] px-6 h-16 flex items-center justify-between">
        <img
          src="/images/logo-travel-connect.svg"
          alt="Travel Connect"
          style={{ height: 36, width: "auto", transform: "scaleY(-1)" }}
        />
        <div className="flex items-center gap-2 text-white/70 text-[13px]">
          <Lock className="h-3.5 w-3.5" />
          {t("checkout.secureCheckout")}
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 py-8">
        {/* Back */}
        <Link
          to="/credits"
          className="inline-flex items-center gap-1.5 text-[13px] text-[#4a5565] hover:text-[#1e2939] mb-6 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("checkout.backToCreditsStore")}
        </Link>

        <div className="grid md:grid-cols-[1fr_320px] gap-6 items-start">
          {/* ── LEFT: Form ── */}
          <div className="bg-white rounded-[10px] border border-[#dbdbdb] overflow-hidden">
            {/* Section header */}
            <div className="px-6 py-4 border-b border-[#f3f3f3]">
              <h2 className="text-[16px] font-semibold text-[#1e2939]">
                {t("checkout.paymentData")}
              </h2>
              <p className="text-[13px] text-[#4a5565] mt-0.5">
                {t("checkout.sslProtectedDesc")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              {/* Email */}
              <Field label={t("checkout.emailConfirmation")}>
                <input
                  type="email"
                  className={inputCls}
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </Field>

              {/* CPF */}
              <Field label={t("checkout.cpf")} hint={t("checkout.cpfHint")}>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                    const fmt = v
                      .replace(/(\d{3})(\d)/, "$1.$2")
                      .replace(/(\d{3})(\d)/, "$1.$2")
                      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                    setForm({ ...form, cpf: fmt });
                  }}
                  required
                />
              </Field>

              <div className="border-t border-[#f3f3f3] pt-1" />

              {/* Card name */}
              <Field label={t("checkout.cardNamePrinted")}>
                <input
                  type="text"
                  className={inputCls}
                  placeholder="Ex.: LUCIANE S SILVA"
                  value={form.cardName}
                  onChange={(e) =>
                    setForm({ ...form, cardName: e.target.value.toUpperCase() })
                  }
                  required
                />
              </Field>

              {/* Card number */}
              <Field label={t("checkout.cardNumber")}>
                <div className="relative">
                  <input
                    type="text"
                    className={`${inputCls} pr-14 tracking-wider font-mono`}
                    placeholder="0000 0000 0000 0000"
                    value={form.cardNumber}
                    maxLength={19}
                    onChange={(e) =>
                      setForm({ ...form, cardNumber: fmtCardNumber(e.target.value) })
                    }
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CardBrandIcon brand={brand} />
                  </div>
                </div>
              </Field>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <Field label={t("checkout.expiry")} hint="MM/AA">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="MM/AA"
                    value={form.expiry}
                    maxLength={5}
                    onChange={(e) =>
                      setForm({ ...form, expiry: fmtExpiry(e.target.value) })
                    }
                    required
                  />
                </Field>

                <Field label={t("checkout.cvv")} hint={brand === "amex" ? "4 dígitos" : "3 dígitos"}>
                  <div className="relative">
                    <input
                      type="text"
                      className={`${inputCls} pr-10`}
                      placeholder={brand === "amex" ? "0000" : "000"}
                      value={form.cvv}
                      maxLength={brand === "amex" ? 4 : 3}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                        })
                      }
                      required
                    />
                    <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9c9c9c]" />
                  </div>
                </Field>
              </div>

              {/* Installments (visual only) */}
              <Field label={t("checkout.installments")}>
                <select
                  className={`${inputCls} cursor-pointer`}
                  defaultValue="1x"
                >
                  <option value="1x">1x de {plan.totalPrice} {t("checkout.installmentsNoInterest")}</option>
                  <option value="2x">
                    2x de{" "}
                    {(
                      parseFloat(
                        plan.totalPrice.replace("R$ ", "").replace(",", "."),
                      ) / 2
                    )
                      .toFixed(2)
                      .replace(".", ",")} {t("checkout.installmentsNoInterest")}
                  </option>
                  <option value="3x">
                    3x de{" "}
                    {(
                      parseFloat(
                        plan.totalPrice.replace("R$ ", "").replace(",", "."),
                      ) / 3
                    )
                      .toFixed(2)
                      .replace(".", ",")} {t("checkout.installmentsNoInterest")}
                  </option>
                </select>
              </Field>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] rounded-[10px] text-[15px] font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 mt-1"
                style={{
                  background: loading
                    ? "#9ca3af"
                    : "linear-gradient(135deg, #364763 0%, #cf3952 100%)",
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    {t("checkout.payingButton")}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    {t("checkout.payButton", { price: plan.totalPrice })}
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-3 text-[11px] text-[#9c9c9c]">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" /> SSL 256-bit
                </span>
                <span className="h-3 w-px bg-[#dbdbdb]" />
                <span>Powered by Stripe</span>
                <span className="h-3 w-px bg-[#dbdbdb]" />
                <span>PCI DSS</span>
              </div>
            </form>
          </div>

          {/* ── RIGHT: Summary ── */}
          <div className="flex flex-col gap-4">
            {/* Plan card */}
            <div className="bg-white rounded-[10px] border border-[#dbdbdb] p-5">
              <h3 className="text-[14px] font-semibold text-[#1e2939] mb-4">
                {t("checkout.orderSummary")}
              </h3>

              {/* Plan info */}
              <div className="flex items-center gap-3 pb-4 border-b border-[#f3f3f3]">
                <div
                  className="h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: "rgba(207,57,82,0.1)" }}
                >
                  <PlanIcon className="h-5 w-5 text-[#cf3952]" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1e2939]">
                    Plano {plan.name}
                  </p>
                  <p className="text-[12px] text-[#4a5565]">
                    {plan.credits} Host Credits
                  </p>
                </div>
                {plan.isPopular && (
                  <span className="ml-auto text-[10px] font-semibold text-white bg-[#cf3952] px-2 py-0.5 rounded-full">
                    {t("checkout.popular")}
                  </span>
                )}
              </div>

              {/* Price breakdown */}
              <div className="flex flex-col gap-2 py-4 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#4a5565]">{t("checkout.subtotal")}</span>
                  <span className="text-[#1e2939]">{plan.totalPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4a5565]">{t("checkout.processingFee")}</span>
                  <span className="text-[#4a5565]">{t("checkout.included")}</span>
                </div>
                {plan.paymentType && (
                  <div className="flex justify-between">
                    <span className="text-[#4a5565]">{t("checkout.type")}</span>
                    <span className="text-[#4a5565] capitalize">
                      {plan.paymentType}
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-[#dbdbdb] pt-4 flex justify-between items-baseline">
                <span className="text-[14px] font-semibold text-[#1e2939]">{t("checkout.total")}</span>
                <span className="text-[22px] font-bold text-[#1e2939]">
                  {plan.totalPrice}
                </span>
              </div>

              <p className="text-[11px] text-[#9c9c9c] mt-2">{plan.validity}</p>
            </div>

            {/* What you get */}
            <div className="bg-white rounded-[10px] border border-[#dbdbdb] p-5">
              <h3 className="text-[13px] font-semibold text-[#1e2939] mb-3">
                {t("checkout.benefits.title")}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {[
                  `${plan.credits} ${t("checkout.jobPostings")}`,
                  plan.validity,
                  t("checkout.benefits.unlimited"),
                  t("checkout.chatSupport"),
                  plan.id === "enterprise" ? t("checkout.dedicatedManager") : t("checkout.analyticsPanel"),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[12px] text-[#4a5565]">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2 px-1">
              <Lock className="h-3.5 w-3.5 text-[#9c9c9c] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#9c9c9c] leading-relaxed">
                {t("checkout.noCardStorage")}
              </p>
            </div>

            {/* Accepted cards */}
            <div className="bg-white rounded-[10px] border border-[#dbdbdb] p-4">
              <p className="text-[11px] text-[#9c9c9c] mb-3">{t("checkout.acceptedCards")}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {["VISA", "MC", "AMEX", "ELO", "HIPERCARD"].map((c) => (
                  <span
                    key={c}
                    className="text-[10px] font-bold text-[#4a5565] border border-[#dbdbdb] rounded px-2 py-1"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

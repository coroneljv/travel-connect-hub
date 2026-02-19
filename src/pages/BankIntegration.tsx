import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import BankIntegrationCard from "@/components/shared/BankIntegrationCard";
import type { BankProvider } from "@/components/shared/BankIntegrationCard";

/* ── Mock data — TODO: substituir por query Supabase ── */

const RECOMMENDED_BANKS: BankProvider[] = [
  {
    id: "wise",
    name: "Wise (TransferWise)",
    subtitle: "Internacional",
    logoText: "WISE",
    logoBg: "bg-emerald-100",
    logoColor: "text-emerald-700",
    isInstant: true,
    status: "integrated",
    features: ["Multi-moeda", "Taxas Baixas", "Câmbio Real"],
  },
  {
    id: "paypal",
    name: "PayPal",
    subtitle: "Internacional",
    logoText: "P",
    logoBg: "bg-blue-100",
    logoColor: "text-blue-700",
    isInstant: true,
    status: "recommended",
    features: ["Global", "Proteção ao Comprador", "Aceito Mundialmente"],
  },
  {
    id: "revolut",
    name: "Revolut",
    subtitle: "Internacional",
    logoText: "R",
    logoBg: "bg-navy-100",
    logoColor: "text-navy-700",
    isInstant: true,
    status: "recommended",
    features: ["Crypto", "Ações", "Multi-moeda"],
  },
  {
    id: "stripe",
    name: "Stripe",
    subtitle: "Internacional",
    logoText: "S",
    logoBg: "bg-indigo-100",
    logoColor: "text-indigo-700",
    isInstant: true,
    status: "recommended",
    features: ["Pagamentos Online", "API Poderosa", "Multi-moeda"],
  },
];

const OTHER_BANKS: BankProvider[] = [
  {
    id: "n26",
    name: "N26",
    subtitle: "Internacional",
    logoText: "N26",
    logoBg: "bg-navy-100",
    logoColor: "text-navy-700",
    isInstant: true,
    status: "recommended",
    features: ["Banco Digital Europeu"],
  },
  {
    id: "payoneer",
    name: "Payoneer",
    subtitle: "Internacional",
    logoText: "P",
    logoBg: "bg-orange-100",
    logoColor: "text-orange-700",
    isInstant: true,
    status: "recommended",
    features: ["Pagamentos Freelancer"],
  },
];

const SECURITY_FEATURES = [
  "Certificação PCI DSS",
  "Criptografia SSL 256-bit",
  "Autenticação Dois Fatores",
];

/* ── Page ── */

export default function BankIntegration() {
  const handleConnect = (bankId: string) => {
    // TODO: abrir fluxo de conexão com o banco via Supabase / n8n
    const bank = [...RECOMMENDED_BANKS, ...OTHER_BANKS].find(
      (b) => b.id === bankId,
    );
    if (bank?.status === "integrated") {
      toast.info(`${bank.name} já está integrado`);
    } else {
      toast.success(`Conectando com ${bank?.name ?? bankId}...`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard"
          className="text-tc-text-primary hover:text-tc-text-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-tc-text-primary">
            Conectar Conta Bancária
          </h1>
          <p className="text-sm text-tc-text-hint">
            Escolha seu banco para receber pagamentos
          </p>
        </div>
      </div>

      {/* Security card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-navy-50 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-navy-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-tc-text-primary">
                Conexão Segura e Criptografada
              </p>
              <p className="text-xs text-tc-text-hint mt-1">
                Suas informações bancárias são protegidas com criptografia de
                nível bancário. Nunca armazenamos suas credenciais de acesso.
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                {SECURITY_FEATURES.map((feature) => (
                  <span
                    key={feature}
                    className="flex items-center gap-1 text-xs text-tc-online font-medium"
                  >
                    <span>✅</span> {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended banks */}
      <div>
        <h2 className="text-base font-semibold text-tc-text-primary mb-3">
          Bancos Recomendados
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {RECOMMENDED_BANKS.map((bank) => (
            <BankIntegrationCard
              key={bank.id}
              bank={bank}
              onConnect={handleConnect}
            />
          ))}
        </div>
      </div>

      {/* Other banks */}
      <div className="border-t border-border pt-6">
        <h2 className="text-base font-semibold text-tc-text-primary mb-3">
          Outros Bancos
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {OTHER_BANKS.map((bank) => (
            <BankIntegrationCard
              key={bank.id}
              bank={bank}
              onConnect={handleConnect}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

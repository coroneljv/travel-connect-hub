import { ChevronRight, Zap, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import IntegrationStatusBadge from "./IntegrationStatusBadge";
import type { IntegrationStatus } from "./IntegrationStatusBadge";

export interface BankProvider {
  id: string;
  name: string;
  subtitle: string;
  logoText: string;
  logoBg: string;
  logoColor: string;
  isInstant: boolean;
  status: IntegrationStatus;
  features: string[];
}

interface BankIntegrationCardProps {
  bank: BankProvider;
  onConnect: (bankId: string) => void;
}

export default function BankIntegrationCard({
  bank,
  onConnect,
}: BankIntegrationCardProps) {
  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onConnect(bank.id)}
    >
      <CardContent className="p-5">
        {/* Header: logo + name + badge + chevron */}
        <div className="flex items-start gap-3">
          <div
            className={`h-12 w-12 rounded-lg ${bank.logoBg} flex items-center justify-center shrink-0`}
          >
            <span className={`text-sm font-bold ${bank.logoColor}`}>
              {bank.logoText}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-tc-text-primary">
                  {bank.name}
                </p>
                <p className="text-xs text-tc-text-hint">{bank.subtitle}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <IntegrationStatusBadge status={bank.status} />
                <ChevronRight className="h-4 w-4 text-tc-text-hint" />
              </div>
            </div>

            {/* Instant tag */}
            {bank.isInstant && (
              <div className="flex items-center gap-1 mt-1.5">
                <Zap className="h-3 w-3 text-tc-online" />
                <span className="text-xs text-tc-online font-medium">
                  Instantâneo
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        {bank.features.length > 0 && (
          <div className="mt-3 space-y-1">
            {bank.features.map((feature) => (
              <div key={feature} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-tc-online shrink-0" />
                <span className="text-xs text-tc-text-secondary">{feature}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

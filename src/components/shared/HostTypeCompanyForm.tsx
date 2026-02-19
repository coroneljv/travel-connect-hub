import { ShieldCheck, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HostSignupStep3CompanyData {
  cnpj: string;
  foundationYear: string;
  companySize: string;
}

interface HostTypeCompanyFormProps {
  value: HostSignupStep3CompanyData;
  onChange: (data: HostSignupStep3CompanyData) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const REQUIRED_DOCUMENTS = [
  "Cartão CNPJ",
  "Contrato Social ou Estatuto",
];

/* TODO: popular com lista real de portes empresariais */
const COMPANY_SIZES = [
  "MEI",
  "ME (Microempresa)",
  "EPP (Empresa de Pequeno Porte)",
  "Médio Porte",
  "Grande Porte",
];

function DocumentUploadRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 bg-gray-50">
      <UploadCloud className="h-5 w-5 text-tc-text-hint shrink-0" />
      <span className="flex-1 text-sm text-tc-text-secondary truncate">
        {label}
      </span>
      {/* TODO: integrar upload real via Supabase Storage */}
      <Button
        type="button"
        size="sm"
        className="bg-navy-500 hover:bg-navy-600 text-white text-xs shrink-0"
      >
        Upload
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function HostTypeCompanyForm({
  value,
  onChange,
}: HostTypeCompanyFormProps) {
  const update = (patch: Partial<HostSignupStep3CompanyData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      {/* Host type label */}
      <p className="text-sm text-tc-text-secondary">
        Tipo de anfitrião:{" "}
        <span className="font-medium">Empresa</span>
      </p>

      {/* Verification info box */}
      <div className="flex gap-3 items-start border border-border rounded-lg p-4 bg-white">
        <ShieldCheck className="h-5 w-5 text-navy-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-tc-text-primary">
            Verificação por IA
          </p>
          <p className="text-xs text-tc-text-secondary leading-relaxed mt-1">
            Nosso sistema de IA analisará automaticamente seus documentos para
            verificar autenticidade, validade e conformidade. O processo é rápido
            e seguro.
          </p>
        </div>
      </div>

      {/* CNPJ + Ano de Fundação — 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-cnpj-company">
            CNPJ<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-cnpj-company"
            placeholder="00.000.000/0000-00"
            value={value.cnpj}
            onChange={(e) => update({ cnpj: e.target.value })}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-foundation-year-company">
            Ano de Fundação<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-foundation-year-company"
            placeholder="2015"
            value={value.foundationYear}
            onChange={(e) => update({ foundationYear: e.target.value })}
            className="bg-gray-50"
          />
        </div>
      </div>

      {/* Porte da Empresa — full width */}
      <div className="space-y-2">
        <Label htmlFor="reg-company-size">
          Porte da Empresa<span className="text-rose-500">*</span>
        </Label>
        <Select
          value={value.companySize}
          onValueChange={(v) => update({ companySize: v })}
        >
          <SelectTrigger id="reg-company-size" className="bg-gray-50">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Required documents */}
      <div className="space-y-3">
        <Label className="text-base font-semibold block">
          Documentos Necessários<span className="text-rose-500"> *</span>
        </Label>
        {REQUIRED_DOCUMENTS.map((doc) => (
          <DocumentUploadRow key={doc} label={doc} />
        ))}
      </div>
    </div>
  );
}

import { ShieldCheck, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HostSignupStep3FarmData {
  cnpj: string;
  car: string;
  propertySize: string;
}

interface HostTypeFarmFormProps {
  value: HostSignupStep3FarmData;
  onChange: (data: HostSignupStep3FarmData) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const REQUIRED_DOCUMENTS = [
  "CPF ou CNPJ",
  "Recibo CAR (Cadastro Ambiental Rural)",
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

export default function HostTypeFarmForm({
  value,
  onChange,
}: HostTypeFarmFormProps) {
  const update = (patch: Partial<HostSignupStep3FarmData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      {/* Host type label */}
      <p className="text-sm text-tc-text-secondary">
        Tipo de anfitrião:{" "}
        <span className="font-medium">Fazenda / Sítio</span>
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

      {/* CNPJ + CAR — 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-cnpj-farm">
            CNPJ<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-cnpj-farm"
            placeholder="00.000.000/0000-00"
            value={value.cnpj}
            onChange={(e) => update({ cnpj: e.target.value })}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-car">
            CAR - Cadastro Ambiental Rural<span className="text-rose-500"> *</span>
          </Label>
          <Input
            id="reg-car"
            placeholder="Número do CAR"
            value={value.car}
            onChange={(e) => update({ car: e.target.value })}
            className="bg-gray-50"
          />
        </div>
      </div>

      {/* Property size — full width */}
      <div className="space-y-2">
        <Label htmlFor="reg-property-size">
          Tamanho da Propriedade (hectares)<span className="text-rose-500"> *</span>
        </Label>
        <Input
          id="reg-property-size"
          placeholder="50"
          value={value.propertySize}
          onChange={(e) => update({ propertySize: e.target.value })}
          className="bg-gray-50"
        />
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

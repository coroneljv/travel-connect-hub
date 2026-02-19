import { ShieldCheck, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HostSignupStep3HotelData {
  cnpj: string;
  cadastur: string;
  roomCount: string;
  totalCapacity: string;
}

interface HostTypeHotelFormProps {
  value: HostSignupStep3HotelData;
  onChange: (data: HostSignupStep3HotelData) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const REQUIRED_DOCUMENTS = [
  "Cartão CNPJ (PDF ou imagem)",
  "Alvará de Funcionamento",
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

export default function HostTypeHotelForm({
  value,
  onChange,
}: HostTypeHotelFormProps) {
  const update = (patch: Partial<HostSignupStep3HotelData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      {/* Host type label */}
      <p className="text-sm text-tc-text-secondary">
        Tipo de anfitrião:{" "}
        <span className="font-medium">Hotel / Pousada</span>
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

      {/* CNPJ + CADASTUR — 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-cnpj-hotel">
            CNPJ<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-cnpj-hotel"
            placeholder="00.000.000/0000-00"
            value={value.cnpj}
            onChange={(e) => update({ cnpj: e.target.value })}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-cadastur-hotel">
            CADASTUR<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-cadastur-hotel"
            placeholder="Número CADASTUR"
            value={value.cadastur}
            onChange={(e) => update({ cadastur: e.target.value })}
            className="bg-gray-50"
          />
        </div>
      </div>

      {/* Room count + Total capacity — 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-room-count-hotel">
            Número de Quartos<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-room-count-hotel"
            placeholder="10"
            value={value.roomCount}
            onChange={(e) => update({ roomCount: e.target.value })}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-total-capacity-hotel">
            Capacidade Total<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-total-capacity-hotel"
            placeholder="30 pessoas"
            value={value.totalCapacity}
            onChange={(e) => update({ totalCapacity: e.target.value })}
            className="bg-gray-50"
          />
        </div>
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

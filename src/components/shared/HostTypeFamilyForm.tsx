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

export interface HostSignupStep3FamilyData {
  cpf: string;
  familyMembers: string;
}

interface HostTypeFamilyFormProps {
  value: HostSignupStep3FamilyData;
  onChange: (data: HostSignupStep3FamilyData) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const REQUIRED_DOCUMENTS = [
  "Documento de Identidade com Foto (RG ou CNH)",
  "Comprovante de Residência (máx. 3 meses)",
  "Selfie com Documento (verificação)",
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

export default function HostTypeFamilyForm({
  value,
  onChange,
}: HostTypeFamilyFormProps) {
  const update = (patch: Partial<HostSignupStep3FamilyData>) =>
    onChange({ ...value, ...patch });

  return (
    <div className="space-y-5">
      {/* Host type label */}
      <p className="text-sm text-tc-text-secondary">
        Tipo de anfitrião: <span className="font-medium">Família</span>
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

      {/* CPF + Family members — 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="reg-cpf-family">
            CPF do Responsável<span className="text-rose-500">*</span>
          </Label>
          <Input
            id="reg-cpf-family"
            placeholder="000.000.000-00"
            value={value.cpf}
            onChange={(e) => update({ cpf: e.target.value })}
            className="bg-gray-50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reg-family-members">
            Número de Membros da Família<span className="text-rose-500">*</span>
          </Label>
          <Select
            value={value.familyMembers}
            onValueChange={(v) => update({ familyMembers: v })}
          >
            <SelectTrigger id="reg-family-members" className="bg-gray-50">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {["1", "2", "3", "4", "5", "6", "7", "8+"].map((n) => (
                <SelectItem key={n} value={n}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

import { useState } from "react";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

interface ApplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityTitle: string;
  opportunityId: string;
  skills: string[];
}

const MAX_CHARS = 500;

const INFO_ITEMS = [
  "Certifique-se de que suas datas estao corretas",
  "Seja claro e honesto em sua mensagem",
  "Destaque suas habilidades relevantes",
  "O anfitriao respondera em ate 48 horas",
];

export default function ApplyModal({
  open,
  onOpenChange,
  opportunityTitle,
  opportunityId,
  skills,
}: ApplyModalProps) {
  const { user, organization } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const charCount = message.length;
  const isValid = charCount > 0 && charCount <= MAX_CHARS;

  const handleSubmit = async () => {
    if (!isValid || !user?.id || !organization?.id) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("proposals").insert({
        request_id: opportunityId,
        supplier_profile_id: user.id,
        supplier_org_id: organization.id,
        message,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Candidatura enviada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      setMessage("");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao enviar candidatura. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[450px] p-4 gap-4">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-tc-text-primary">
            Candidatar-se
          </DialogTitle>
          <DialogDescription className="text-base font-medium text-navy-500">
            {opportunityTitle}
          </DialogDescription>
        </DialogHeader>

        {/* Info Box */}
        <div className="rounded-lg border border-navy-500 bg-navy-500/10 p-4 space-y-2">
          <p className="text-sm font-medium text-navy-500">
            Antes de se candidatar
          </p>
          <ul className="space-y-1">
            {INFO_ITEMS.map((item, i) => (
              <li key={i} className="text-sm text-navy-500">
                &middot; {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <label className="text-base font-medium text-tc-text-label">
              Mensagem para o anfitriao
            </label>
            <span className="text-sm text-tc-text-hint">
              ({charCount}/{MAX_CHARS})
            </span>
          </div>
          <Textarea
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setMessage(e.target.value);
              }
            }}
            placeholder="Conte ao anfitriao por que voce e ideal para esta oportunidade. Mencione suas habilidades relevantes, experiencias anteriores e o que voce espera aprender..."
            className="min-h-[200px] bg-[#F3F3F3] border-border rounded-lg text-sm placeholder:text-tc-text-placeholder resize-none"
          />
        </div>

        {/* Skills */}
        <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-3">
          <p className="text-base font-medium text-tc-text-label">
            Habilidades do seu perfil
          </p>
          <div className="flex flex-wrap gap-1.5">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-0.5 text-sm font-medium rounded-pill bg-tc-blue-bg text-tc-blue-text"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 pt-2">
          <Button
            variant="secondary"
            className="flex-1 bg-[#E0E0E0] hover:bg-[#D0D0D0] text-tc-text-primary"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Voltar
          </Button>
          <Button
            className="flex-1 bg-navy-500 hover:bg-navy-600 text-white gap-2"
            onClick={handleSubmit}
            disabled={!isValid || submitting}
          >
            <Send className="h-4 w-4" />
            {submitting ? "Enviando..." : "Enviar Candidatura"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

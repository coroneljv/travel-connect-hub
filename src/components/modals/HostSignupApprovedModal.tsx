import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface HostSignupApprovedModalProps {
  open: boolean;
  onClose: () => void;
  onPrimaryAction: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HostSignupApprovedModal({
  open,
  onClose,
  onPrimaryAction,
}: HostSignupApprovedModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm p-6 rounded-lg">
        <DialogHeader className="text-center space-y-3">
          <DialogTitle className="text-left text-sm font-medium text-tc-text-secondary">
            Concluído
          </DialogTitle>

          <p className="text-lg font-bold text-navy-500 text-center">
            O seu cadastro foi feito!
          </p>

          <DialogDescription className="text-sm text-tc-text-secondary text-center leading-relaxed">
            Nossa IA vai validar o seu cadastro. Assim que concluído e aprovado
            você receberá um e-mail de confirmação.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={onPrimaryAction}
          className="w-full py-3 rounded-lg font-medium text-white bg-navy-500 hover:bg-navy-600 transition-colors mt-2"
        >
          Fechar
        </button>
      </DialogContent>
    </Dialog>
  );
}

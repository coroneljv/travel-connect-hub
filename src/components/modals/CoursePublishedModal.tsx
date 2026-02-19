import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CoursePublishedModalProps {
  open: boolean;
  onClose: () => void;
  courseName: string;
}

export default function CoursePublishedModal({ open, onClose, courseName }: CoursePublishedModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-tc-text-primary">
            Curso Publicado
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pb-2">
          <p className="text-base font-medium text-tc-text-primary">{courseName}</p>
          <p className="text-sm text-tc-text-secondary">
            Agora você pode visualizar o curso publicado com os seus demais cursos na plataforma!
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-lg font-medium text-white bg-navy-500 hover:bg-navy-600 transition-colors text-sm"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

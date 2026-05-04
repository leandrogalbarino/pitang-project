import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface FormFooterProps {
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

export function FormFooter({
  onCancel,
  isSubmitting,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
}: FormFooterProps) {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Salvando...' : submitLabel}
      </Button>
    </DialogFooter>
  );
}

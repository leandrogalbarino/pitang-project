import { DialogContent } from '@/components/ui/dialog';
import { FormHeader } from './FormHeader';
import { FormFooter } from './FormFooter';

interface FormModalLayoutProps {
  title: string;
  description: string;
  onCancel: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => any;
  isSubmitting: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function FormModalLayout({
  title,
  description,
  onCancel,
  onSubmit,
  isSubmitting,
  submitLabel,
  cancelLabel,
  children,
  maxWidth = 'sm:max-w-[500px]',
}: FormModalLayoutProps) {
  return (
    <DialogContent
      className={maxWidth}
      onPointerDownOutside={(e) => e.preventDefault()}
    >
      <FormHeader title={title} description={description} />

      <form onSubmit={onSubmit}>
        <div className="grid gap-4 py-4">
          {children}
        </div>

        <FormFooter
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
        />
      </form>
    </DialogContent>
  );
}

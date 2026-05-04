import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';

interface PageHeaderProps {
  title: string;
  description: string;
  buttonLabel: string;
  isFormOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNew: () => void;
  children: React.ReactNode;
  buttonDisabled?: boolean;
}

export function PageHeader({
  title,
  description,
  buttonLabel,
  isFormOpen,
  onOpenChange,
  onAddNew,
  children,
  buttonDisabled = false,
}: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-slate-500">{description}</p>
      </div>

      <Dialog open={isFormOpen} onOpenChange={onOpenChange}>
        {!buttonDisabled && (
          <Button onClick={onAddNew} className="rounded-full gap-2">
            <Plus className="w-4 h-4" />
            {buttonLabel}
          </Button>
        )}

        {isFormOpen && children}
      </Dialog>
    </header>
  );
}

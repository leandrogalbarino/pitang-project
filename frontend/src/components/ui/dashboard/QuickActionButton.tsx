import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';

interface QuickActionButtonProps {
  onClick: () => void;
  label: string;
}

export function QuickActionButton({ onClick, label }: QuickActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="secondary"
      className="w-full cursor-pointer justify-between bg-white/10 hover:bg-white/20 border-white/10 text-white font-semibold py-6 rounded-xl transition-all hover:translate-x-1"
    >
      {label}
      <ArrowUpRight className="w-5 h-5" />
    </Button>
  );
}

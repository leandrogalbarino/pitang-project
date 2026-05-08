import { Clock } from 'lucide-react';
import type { RequestHistory } from '@/types/reimbursementTypes';
import { HistoryItem } from '@/components/ui/dashboard/reimbursements/history/HistoryItem';

interface ReimbursementHistoryProps {
  history: RequestHistory[];
}

export function ReimbursementHistory({ history }: ReimbursementHistoryProps) {
  // Estado vazio: quando não há histórico para a solicitação
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <Clock className="w-8 h-8 mb-2 opacity-20" />
        <p className="text-sm italic">Nenhum histórico registrado.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
      {history.map((item) => (
        <HistoryItem key={item.id} item={item} />
      ))}
    </div>
  );
}

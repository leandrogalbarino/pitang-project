import { formatDateTime } from '@/lib/utils';
import type { RequestHistory, HistoryAction } from '@/types/reimbursementTypes';
import { CheckCircle2, XCircle, Send, Clock, CreditCard, FileEdit, PlusCircle } from 'lucide-react';

interface ReimbursementHistoryProps {
  history: RequestHistory[];
}

const actionIcons: Record<HistoryAction, any> = {
  CREATED: PlusCircle,
  UPDATED: FileEdit,
  SUBMITTED: Send,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  PAID: CreditCard,
  CANCELED: XCircle,
};

const actionLabels: Record<HistoryAction, string> = {
  CREATED: 'Solicitação Criada',
  UPDATED: 'Solicitação Atualizada',
  SUBMITTED: 'Enviada para Análise',
  APPROVED: 'Solicitação Aprovada',
  REJECTED: 'Solicitação Rejeitada',
  PAID: 'Reembolso Pago',
  CANCELED: 'Solicitação Cancelada',
};

const actionColors: Record<HistoryAction, string> = {
  CREATED: 'text-slate-400',
  UPDATED: 'text-blue-400',
  SUBMITTED: 'text-blue-500',
  APPROVED: 'text-green-500',
  REJECTED: 'text-destructive',
  PAID: 'text-emerald-600',
  CANCELED: 'text-slate-500',
};

export function ReimbursementHistory({ history }: ReimbursementHistoryProps) {
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
      {history.map((item) => {
        const Icon = actionIcons[item.action] || Clock;
        const colorClass = actionColors[item.action] || 'text-slate-500';

        return (
          <div key={item.id} className="relative flex items-start gap-4 group">
            <div className={`absolute left-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-slate-50 shadow-sm transition-transform group-hover:scale-110 z-10 ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            
            <div className="flex-1 ml-12 pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-slate-900">
                  {actionLabels[item.action]}
                </span>
                <time className="text-[10px] uppercase font-bold text-slate-400">
                  {formatDateTime(item.createdAt)}
                </time>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed">
                Por <span className="font-semibold text-slate-700">{item.user?.name}</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase font-medium">
                   {item.user?.role}
                </span>
              </p>
              
              {item.observation && (
                <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 italic relative before:absolute before:-top-2 before:left-4 before:w-4 before:h-4 before:bg-slate-50 before:border-l before:border-t before:border-slate-100 before:rotate-45">
                  "{item.observation}"
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

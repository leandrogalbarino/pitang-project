import type { ReimbursementStatus } from '@/types/reimbursementTypes';

const statusConfig: Record<ReimbursementStatus, { label: string; style: string; dot: string }> = {
  RASCUNHO: {
    label: 'Rascunho',
    style: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
  ENVIADO: {
    label: 'Aguardando Análise',
    style: 'bg-red-50 text-red-700 border-red-100',
    dot: 'bg-red-500',
  },
  APROVADO: {
    label: 'Aprovado',
    style: 'bg-blue-50 text-blue-700 border-blue-100',
    dot: 'bg-blue-500',
  },
  REJEITADO: {
    label: 'Rejeitado',
    style: 'bg-rose-50 text-rose-700 border-rose-100',
    dot: 'bg-rose-500',
  },
  PAGO: {
    label: 'Pago',
    style: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    dot: 'bg-emerald-500',
  },
  CANCELADO: {
    label: 'Cancelado',
    style: 'bg-slate-50 text-slate-400 border-slate-200',
    dot: 'bg-slate-300',
  },
};

export function ReimbursementStatusBadge({ status }: { status: ReimbursementStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded-full border ${config.style} transition-all`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

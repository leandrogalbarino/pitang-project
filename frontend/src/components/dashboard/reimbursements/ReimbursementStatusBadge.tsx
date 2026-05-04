import type { ReimbursementStatus } from '@/types/reimbursementTypes';

const statusLabels: Record<ReimbursementStatus, string> = {
  RASCUNHO: 'Rascunho',
  ENVIADO: 'Enviado',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  PAGO: 'Pago',
  CANCELADO: 'Cancelado',
};

const statusStyles: Record<ReimbursementStatus, string> = {
  RASCUNHO: 'bg-slate-100 text-slate-700',
  ENVIADO: 'bg-blue-100 text-blue-700',
  APROVADO: 'bg-green-100 text-green-700',
  REJEITADO: 'bg-red-100 text-red-700',
  PAGO: 'bg-emerald-100 text-emerald-700',
  CANCELADO: 'bg-slate-100 text-slate-500',
};

export function ReimbursementStatusBadge({ status }: { status: ReimbursementStatus }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

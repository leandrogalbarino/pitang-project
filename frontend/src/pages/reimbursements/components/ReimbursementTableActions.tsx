import { Button } from '@/components/ui/button';
import {
  Edit2,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Reimbursement } from '@/types/reimbursementTypes';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
  className?: string;
}

function ActionButton({
  icon: Icon,
  title,
  onClick,
  className,
}: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-8 text-slate-400 hover:bg-slate-100 transition-colors',
        className,
      )}
      onClick={onClick}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </Button>
  );
}

interface ReimbursementTableActionsProps {
  item: Reimbursement;
  onEdit: (item: Reimbursement) => void;
  onCancel: (item: Reimbursement) => void;
  onSubmit: (item: Reimbursement) => void;
  onApprove: (item: Reimbursement) => void;
  onReject: (item: Reimbursement) => void;
  onPay: (item: Reimbursement) => void;
  onView: (item: Reimbursement) => void;
}

export function ReimbursementTableActions({
  item,
  onEdit,
  onCancel,
  onSubmit,
  onApprove,
  onReject,
  onPay,
  onView,
}: ReimbursementTableActionsProps) {
  const { user } = useAuth();
  const role = user?.role;
  const status = item.status;

  const isColaborador = role === 'COLABORADOR';
  const isGestor = role === 'GESTOR';
  const isFinanceiro = role === 'FINANCEIRO';

  return (
    <div className="flex justify-end gap-1">
      {/* Visualizar - Disponível para todos */}
      <ActionButton
        icon={Eye}
        title="Visualizar detalhes"
        onClick={() => onView(item)}
        className="hover:text-primary"
      />

      {/* Ações do Colaborador */}
      {isColaborador && status === 'RASCUNHO' && (
        <>
          <ActionButton
            icon={Edit2}
            title="Editar rascunho"
            onClick={() => onEdit(item)}
            className="hover:text-primary"
          />
          <ActionButton
            icon={Send}
            title="Enviar para análise"
            onClick={() => onSubmit(item)}
            className="text-blue-400 hover:text-blue-600"
          />
          <ActionButton
            icon={Trash2}
            title="Cancelar solicitação"
            onClick={() => onCancel(item)}
            className="hover:text-destructive"
          />
        </>
      )}

      {/* Ações do Gestor */}
      {isGestor && status === 'ENVIADO' && (
        <>
          <ActionButton
            icon={CheckCircle}
            title="Aprovar solicitação"
            onClick={() => onApprove(item)}
            className="text-green-500 hover:text-green-700"
          />
          <ActionButton
            icon={XCircle}
            title="Rejeitar solicitação"
            onClick={() => onReject(item)}
            className="text-red-500 hover:text-red-700"
          />
        </>
      )}

      {/* Ações do Financeiro */}
      {isFinanceiro && status === 'APROVADO' && (
        <ActionButton
          icon={DollarSign}
          title="Marcar como pago"
          onClick={() => onPay(item)}
          className="text-emerald-500 hover:text-emerald-700"
        />
      )}
    </div>
  );
}

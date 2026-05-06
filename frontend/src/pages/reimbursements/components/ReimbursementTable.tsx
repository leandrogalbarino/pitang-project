import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Reimbursement } from '@/types/reimbursementTypes';
import ListEmpty from '@/components/dashboard/ListEmpty';
import { TableContainer } from '@/components/dashboard/TableContainer';
import { ReimbursementStatusBadge } from '../../../components/dashboard/reimbursements/ReimbursementStatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ReimbursementTableActions } from './ReimbursementTableActions';
import { useAuth } from '@/contexts/AuthContext';

interface ReimbursementTableProps {
  reimbursements: Reimbursement[];
  onEdit: (reimbursement: Reimbursement) => void;
  onCancel: (reimbursement: Reimbursement) => void;
  onSubmit: (reimbursement: Reimbursement) => void;
  onApprove: (reimbursement: Reimbursement) => void;
  onReject: (reimbursement: Reimbursement) => void;
  onPay: (reimbursement: Reimbursement) => void;
  onView: (reimbursement: Reimbursement) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  extraHeader?: React.ReactNode;
}

export function ReimbursementTable({
  reimbursements,
  onEdit,
  onCancel,
  onSubmit,
  onApprove,
  onReject,
  onPay,
  onView,
  searchValue,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  extraHeader,
}: ReimbursementTableProps) {
  const { user } = useAuth();

  return (
    <TableContainer
      searchPlaceholder={
        user?.role === 'COLABORADOR'
          ? 'Buscar por descrição...'
          : 'Buscar por colaborador...'
      }
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      totalItems={totalItems}
      extraHeader={extraHeader}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-slate-50">
            <TableHead>
              {user?.role === 'COLABORADOR' ? 'Descrição' : 'Colaborador'}
            </TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reimbursements.map((item) => (
            <TableRow key={item.id} className="border-slate-50">
              <TableCell className="font-medium text-slate-900 max-w-[200px] truncate">
                {(user?.role === 'COLABORADOR'
                  ? item.description
                  : item.user?.name) || 'Desconhecido'}
              </TableCell>
              <TableCell className="text-slate-500">
                {item.category?.name || 'Sem categoria'}
              </TableCell>
              <TableCell className="text-slate-500">
                {formatDate(item.expenseDate)}
              </TableCell>
              <TableCell className="font-semibold text-slate-900">
                {formatCurrency(item.amount)}
              </TableCell>
              <TableCell>
                <ReimbursementStatusBadge status={item.status} />
              </TableCell>
              <TableCell className="text-right">
                <ReimbursementTableActions
                  item={item}
                  onEdit={onEdit}
                  onCancel={onCancel}
                  onSubmit={onSubmit}
                  onApprove={onApprove}
                  onReject={onReject}
                  onPay={onPay}
                  onView={onView}
                />
              </TableCell>
            </TableRow>
          ))}
          {reimbursements.length === 0 && (
            <ListEmpty message="Nenhuma solicitação encontrada." />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

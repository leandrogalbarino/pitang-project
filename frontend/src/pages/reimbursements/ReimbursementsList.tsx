import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';
import { api, type ApiError } from '@/lib/api-client';
import { ReimbursementTable } from './components/ReimbursementTable';
import { ConfirmActionDialog } from '@/components/ui/dashboard/ConfirmActionDialog';
import { toast } from 'sonner';
import type {
  Reimbursement,
} from '@/types/reimbursementTypes';
import { PageHeader } from '@/components/ui/dashboard/PageHeader';
import { useAuth } from '@/contexts/AuthContext';
import { ReimbursementForm } from './components/ReimbursementForm';
import { RejectReimbursementDialog } from './components/RejectReimbursementDialog';
import { ReimbursementDetails } from './components/ReimbursementDetails';
import type { RejectionFormData } from '@/schemas/reimbursementSchema';
import { formatCurrency } from '@/lib/utils';
import type { CategoriesResponse } from '@/types/categoriesTypes';
import { ReimbursementFilters } from './components/ReimbursementFilters';
import { useReimbursements } from '@/hooks/reimbursements/useReimbursements';

const confirmTitles = {
  cancel: 'Cancelar solicitação?',
  submit: 'Enviar para análise?',
  approve: 'Aprovar solicitação?',
  pay: 'Registrar pagamento?',
};

const endpoints = {
  cancel: 'cancel',
  submit: 'submit',
  approve: 'approve',
  pay: 'pay',
};

const messagesSuccess = {
  cancel: 'Solicitação cancelada com sucesso.',
  submit: 'Solicitação enviada para análise.',
  approve: 'Solicitação aprovada com sucesso.',
  pay: 'Pagamento registrado com sucesso.',
};

export default function ReimbursementsList() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Inicializa o estado a partir da URL ou valores padrão
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const categoryFilter = searchParams.get('category') || '';
  const order = searchParams.get('order') || 'date';
  const orderDirection = searchParams.get('orderDirection') || 'desc';

  const { reimbursements, pagination, mutate, isLoading } = useReimbursements({
    page,
    search,
    status: statusFilter,
    category: categoryFilter,
    order,
    orderDirection,
  });

  const { data: categoriesResponse } = useSWR<CategoriesResponse>(
    '/categories?limit=100',
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<
    'cancel' | 'submit' | 'approve' | 'pay' | null
  >(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Reimbursement | null>(null);

  const setPage = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newPage <= 1) {
      nextParams.delete('page');
    } else {
      nextParams.set('page', String(newPage));
    }
    setSearchParams(nextParams);
  };

  const updateFilters = (updates: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        nextParams.set(key, value);
      } else {
        nextParams.delete(key);
      }
    });
    nextParams.delete('page'); // Reset pagination on filter change
    setSearchParams(nextParams);
  };

  const setSearch = (newSearch: string) => {
    updateFilters({ search: newSearch });
  };

  const handleEdit = (item: Reimbursement) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleActionClick = (
    item: Reimbursement,
    type: 'cancel' | 'submit' | 'approve' | 'pay',
  ) => {
    setSelectedItem(item);
    setConfirmType(type);
    setIsConfirmOpen(true);
  };

  const handleRejectClick = (item: Reimbursement) => {
    setSelectedItem(item);
    setIsRejectOpen(true);
  };

  const handleView = (item: Reimbursement) => {
    setSelectedItem(item);
    setIsDetailsOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedItem || !confirmType) return;

    try {
      setIsProcessing(true);
      await api.post(
        `/reimbursements/${selectedItem.id}/${endpoints[confirmType]}`,
      );

      mutate();
      setIsConfirmOpen(false);
      toast.success('Ação concluída', {
        description: messagesSuccess[confirmType],
      });
    } catch (error) {
      const apiError = error as ApiError;
      console.error(`Erro ao executar ${confirmType}`, apiError);
      toast.error('Erro na operação', {
        description:
          apiError.message ||
          'Não foi possível concluir a ação. Tente novamente.',
      });
    } finally {
      setIsProcessing(false);
      setIsConfirmOpen(false); // Fecha o popup mesmo em erro
      setSelectedItem(null);
      setConfirmType(null);
    }
  };

  const handleRejectConfirm = async (data: RejectionFormData) => {
    if (!selectedItem) return;

    try {
      await api.post(`/reimbursements/${selectedItem.id}/reject`, {
        rejectionDescription: data.observation,
      });

      mutate();
      setIsRejectOpen(false);
      toast.success('Solicitação rejeitada', {
        description: 'A solicitação foi rejeitada com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao rejeitar', error);
      toast.error('Erro ao rejeitar', {
        description: 'Não foi possível rejeitar a solicitação.',
      });
      setIsRejectOpen(false); // Fecha o popup mesmo em erro
    } finally {
      setSelectedItem(null);
    }
  };

  const handleSuccess = () => {
    mutate();
    setIsFormOpen(false);
    toast.success(
      selectedItem ? 'Solicitação atualizada!' : 'Nova solicitação criada!',
      {
        description: selectedItem
          ? 'As alterações foram salvas com sucesso.'
          : 'Sua solicitação foi salva como rascunho.',
      },
    );
    setSelectedItem(null);
  };

  const confirmDescriptions = {
    cancel: `Deseja realmente cancelar a solicitação "${selectedItem?.description}"? Esta ação não pode ser desfeita.`,
    submit: `A solicitação "${selectedItem?.description}" será enviada para análise do gestor.`,
    approve: `Você está aprovando a solicitação de "${selectedItem?.user?.name}" no valor de ${selectedItem ? formatCurrency(selectedItem.amount) : ''}.`,
    pay: `Deseja registrar o pagamento da solicitação "${selectedItem?.description}"?`,
  };

  return (
    <div className="p-10">
      <PageHeader
        title="Solicitações de Reembolso"
        description="Acompanhe e gerencie as solicitações de reembolso de despesas."
        buttonDisabled={user?.role === 'COLABORADOR' ? false : true}
        buttonLabel={user?.role === 'COLABORADOR' ? 'Nova Solicitação' : ''}
        isFormOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onAddNew={handleAddNew}
      >
        <ReimbursementForm
          reimbursement={selectedItem}
          onSuccess={handleSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      </PageHeader>

      <ReimbursementTable
        reimbursements={reimbursements}
        isLoading={isLoading}
        onEdit={handleEdit}
        onCancel={(item) => handleActionClick(item, 'cancel')}
        onSubmit={(item) => handleActionClick(item, 'submit')}
        onApprove={(item) => handleActionClick(item, 'approve')}
        onReject={handleRejectClick}
        onPay={(item) => handleActionClick(item, 'pay')}
        onView={handleView}
        currentPage={pagination?.page}
        totalPages={pagination?.totalPages}
        onPageChange={setPage}
        totalItems={pagination?.total}
        searchValue={search}
        onSearchChange={setSearch}
        extraHeader={
          <ReimbursementFilters
            statusValue={statusFilter}
            categoryValue={categoryFilter}
            orderValue={order}
            orderDirectionValue={orderDirection}
            onFilterChange={updateFilters}
            categories={categoriesResponse?.data || []}
          />
        }
      />

      <ConfirmActionDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
          if (!open) {
            setSelectedItem(null);
            setConfirmType(null);
          }
        }}
        onConfirm={handleConfirmAction}
        isLoading={isProcessing}
        variant={confirmType === 'cancel' ? 'destructive' : 'default'}
        title={confirmType ? confirmTitles[confirmType] : ''}
        confirmText="Confirmar"
        description={confirmType ? confirmDescriptions[confirmType] : ''}
      />

      <RejectReimbursementDialog
        item={selectedItem}
        open={isRejectOpen}
        onCancel={() => {
          setIsRejectOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleRejectConfirm}
      />

      <ReimbursementDetails
        reimbursementId={selectedItem?.id || null}
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedItem(null);
        }}
      />
    </div>
  );
}

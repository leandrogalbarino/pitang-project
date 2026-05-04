import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useSWR from 'swr';
import { api, type ApiError } from '@/lib/api-client';
import {
  reimbursementSchema,
  type ReimbursementFormData,
} from '@/schemas/reimbursementSchema';
import { formatDateForInput } from '@/lib/utils';
import type { Reimbursement } from '@/types/reimbursementTypes';
import type { CategoriesResponse } from '@/types/categoriesTypes';
import { FormModalLayout } from '@/components/dashboard/FormModalLayout';
import { InputGroup } from '@/components/ui/InputGroup';
import { toast } from 'sonner';
import { handleApiErrors } from '@/lib/form-utils';
// import { data } from 'react-router-dom';
import { TextAreaGroup } from '@/components/ui/TextAreaGroup';
import { CategorySelectGroup } from '@/components/dashboard/reimbursements/CategorySelectGroup';

interface ReimbursementFormProps {
  reimbursement?: Reimbursement | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ReimbursementForm({
  reimbursement,
  onSuccess,
  onCancel,
}: ReimbursementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!reimbursement;

  const { data: categoriesResponse } = useSWR<CategoriesResponse>(
    '/categories?limit=100',
  );

  const initialValues = {
    categoryId: '',
    description: '',
    amount: 0,
    expenseDate: new Date().toISOString().split('T')[0],
  };

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<ReimbursementFormData>({
    resolver: zodResolver(reimbursementSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (reimbursement) {
      reset({
        categoryId: reimbursement ? reimbursement.categoryId : '',
        description: reimbursement ? reimbursement.description : '',
        amount: reimbursement ? reimbursement.amount : reimbursement.amount,
        expenseDate: reimbursement
          ? formatDateForInput(reimbursement.expenseDate)
          : formatDateForInput(new Date()),
      });
    }
  }, [reimbursement, reset]);

  const onSubmit = async (data: ReimbursementFormData) => {
    try {
      setIsSubmitting(true);

      if (isEditing) {
        await api.put(`/reimbursements/${reimbursement.id}`, data);
        onSuccess();
        return;
      }

      await api.post('/reimbursements', data);
      onSuccess();
    } catch (error) {
      if (handleApiErrors(error, setError)) return;
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao salvar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModalLayout
      title={isEditing ? 'Editar Solicitação' : 'Nova Solicitação'}
      description={
        isEditing
          ? 'Altere os dados da sua despesa para reembolso.'
          : 'Preencha os dados da despesa para solicitar o reembolso.'
      }
      onCancel={onCancel}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? 'Salvar Alterações' : 'Salvar como Rascunho'}
    >
      <div className="grid gap-4">
        <CategorySelectGroup
          control={control}
          categories={categoriesResponse.data}
          error={errors.categoryId}
        />

        <TextAreaGroup
          label="Descrição"
          id="description"
          placeholder="Descreva a finalidade da despesa..."
          registration={register('description')}
          error={errors.description}
        />

        <InputGroup
          label="Valor (R$)"
          id="amount"
          type="number"
          placeholder="0.00"
          registration={register('amount')}
          error={errors.amount}
        />

        <InputGroup
          label="Data da Despesa"
          id="expenseDate"
          type="date"
          registration={register('expenseDate')}
          error={errors.expenseDate}
        />
      </div>
    </FormModalLayout>
  );
}

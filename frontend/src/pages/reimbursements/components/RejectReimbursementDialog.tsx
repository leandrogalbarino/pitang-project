import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  rejectionSchema,
  type RejectionFormData,
} from '@/schemas/reimbursementSchema';
import { FormModalLayout } from '@/components/ui/dashboard/FormModalLayout';
import { TextAreaGroup } from '@/components/ui/TextAreaGroup';
import type { Reimbursement } from '@/types/reimbursementTypes';

import { Dialog } from '@/components/ui/dialog';

interface RejectReimbursementDialogProps {
  item: Reimbursement | null;
  onConfirm: (data: RejectionFormData) => Promise<void>;
  onCancel: () => void;
  open: boolean;
}

export function RejectReimbursementDialog({
  item,
  onConfirm,
  onCancel,
  open,
}: RejectReimbursementDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectionFormData>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: {
      observation: '',
    },
  });

  const onSubmit = async (data: RejectionFormData) => {
    try {
      setIsSubmitting(true);
      await onConfirm(data);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <FormModalLayout
        title="Rejeitar Solicitação"
        description={`Por favor, informe o motivo da rejeição para a solicitação "${item?.description}".`}
        onCancel={onCancel}
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        submitLabel="Rejeitar Solicitação"
      >
        <TextAreaGroup
          label="Justificativa"
          id="observation"
          placeholder="Descreva o motivo da rejeição..."
          registration={register('observation')}
          error={errors.observation}
          autoFocus
        />
      </FormModalLayout>
    </Dialog>
  );
}

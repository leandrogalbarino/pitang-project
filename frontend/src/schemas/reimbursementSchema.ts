import { z } from 'zod';

export const reimbursementSchema = z.object({
  categoryId: z.string().min(1, 'A categoria é obrigatória'),
  description: z.string().min(5, 'A descrição deve ter pelo menos 5 caracteres'),
  amount: z.preprocess(
    (val) => Number(val),
    z.number().positive('O valor deve ser maior que zero')
  ),
  expenseDate: z.string().nonempty('A data da despesa é obrigatória'),
});

export type ReimbursementFormData = z.infer<typeof reimbursementSchema>;

export const rejectionSchema = z.object({
  observation: z.string().min(5, 'A justificativa deve ter pelo menos 5 caracteres'),
});

export type RejectionFormData = z.infer<typeof rejectionSchema>;

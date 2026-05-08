import * as z from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const reimbursementSchema = z.object({
  categoryId: z.string().min(1, 'A categoria é obrigatória'),
  description: z
    .string()
    .min(5, 'A descrição deve ter pelo menos 5 caracteres'),
  amount: z
    .number('Informe um valor válido')
    .positive('O valor deve ser maior que zero'),
  expenseDate: z
    .string()
    .min(1, 'A data da despesa é obrigatória')
    .refine(
      (dateStr) => {
        if (!dateStr) return true;
        const now = dayjs().tz('America/Sao_Paulo').startOf('day');
        const inputDate = dayjs(dateStr).startOf('day');
        return !inputDate.isAfter(now);
      },
      {
        message: 'Não é possível colocar uma data posterior a atual.',
      },
    ),
});

export type ReimbursementFormData = z.infer<typeof reimbursementSchema>;

export const rejectionSchema = z.object({
  observation: z
    .string()
    .min(5, 'A justificativa deve ter pelo menos 5 caracteres'),
});

export type RejectionFormData = z.infer<typeof rejectionSchema>;

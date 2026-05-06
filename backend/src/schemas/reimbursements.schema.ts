import { boolean, z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);


export const RequestStatusEnum = z.enum([
  'RASCUNHO',
  'ENVIADO',
  'APROVADO',
  'REJEITADO',
  'PAGO',
  'CANCELADO',
]);

export const HistoryActionEnum = z.enum([
  'CREATED',
  'UPDATED',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
  'PAID',
  'CANCELED',
]);

export const ReimbursementRequestSchema = z.object(
  {
    description: z
      .string('A descrição é obrigatória.')
      .min(5, 'A descrição deve ter pelo menos 5 caracteres.'),
    amount: z
      .number('Insira o valor.')
      .positive('O valor deve ser maior que zero.'),
    expenseDate: z
      .string()
      .min(1, 'A data da despesa é obrigatória.')
      .refine(
        (dateStr) => {
          const now = dayjs().tz('America/Sao_Paulo').startOf('day');
          const inputDate = dayjs(dateStr).startOf('day');
          return !inputDate.isAfter(now);
        },
        {
          message: 'Não é possível colocar uma data posterior a atual',
        },
      ),
    categoryId: z.uuid('ID de categoria inválido.'),
  },
  {
    message: 'Insira os campos necessários.',
  },
);

export const ReimbursementUpdateSchema = z.object(
  {
    description: z.string().min(5).optional(),
    amount: z.number().positive().optional(),
    expenseDate: z
      .string()
      .refine(
        (dateStr) => {
          if (!dateStr) return true;
          const now = dayjs().tz('America/Sao_Paulo').startOf('day');
          const inputDate = dayjs(dateStr).startOf('day');
          return !inputDate.isAfter(now);
        },
        {
          message: 'Não é possível colocar uma data posterior a atual',
        },
      )
      .optional(),
    categoryId: z.uuid('Id inválido.').optional(),
  },
  {
    message: 'Insira os campos necessários.',
  },
);

export const RejectionSchema = z.object(
  {
    rejectionDescription: z
      .string()
      .min(5, 'A justificativa de rejeição deve ter pelo menos 5 caracteres.'),
  },
  {
    message: 'Insira os campos necessários.',
  },
);

export const RequestResponseSchema = z.object({
  id: z.uuid(),
  description: z.string(),
  amount: z.number(),
  expenseDate: z.date(),
  status: RequestStatusEnum,
  rejectionDescription: z.string().nullable(),
  userId: z.uuid(),
  categoryId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});



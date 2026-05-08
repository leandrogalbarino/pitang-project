import * as z from 'zod';

export const categorySchema = z.object({
  name: z
    .string()
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres')
    .nonempty('O nome da categoria é obrigatório'),
  amountMax: z.number('Digite um número.').positive('O valor deve ser maior que zero'),
  active: z.boolean().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

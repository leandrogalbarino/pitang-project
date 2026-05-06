import z from "zod";

export const CategorySchema = z.object(
  {
    name: z
      .string('Forneça o nome da categoria.')
      .min(2, 'O nome da categoria deve ter pelo menos 2 caracteres.'),
    amountMax: z
      .number('Insira o valor.')
      .positive('O valor deve ser maior que zero.'),
    active: z.boolean('O valor precisa ser boleano.').default(true),
  },
  {
    message: 'Insira os campos necessários.',
  },
);

export const CategoryResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  active: z.boolean(),
  amountMax: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
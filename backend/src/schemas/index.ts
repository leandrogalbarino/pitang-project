import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

// --- Enums ---

export const RoleEnum = z.enum([
  'COLABORADOR',
  'GESTOR',
  'FINANCEIRO',
  'ADMIN',
]);

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

// --- User Schemas ---

export const UserRegistrationSchema = z
  .object({
    email: z.email('Formato de email, inválido.'),
    password: z.string().min(3, 'A senha precisa ter pelo menos 3 caracteres.'),
    password2: z
      .string()
      .min(3, 'A senha precisa ter pelo menos 3 caracteres.'),
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    role: RoleEnum.default('COLABORADOR'),
  })
  .refine((data) => data.password === data.password2, {
    message: 'As senhas não são iguais.',
    path: ['password2'],
  });

export const UserResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: RoleEnum,
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserAdminUpdateSchema = z
  .object({
    role: RoleEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização.',
    path: ['message'],
  });

export const UserUpdateSchema = z
  .object({
    name: z.string().min(3).optional(),
    email: z.email().optional(),
    password: z
      .string()
      .min(6, 'A senha precisa ter pelo menos 6 caracteres.')
      .optional()
      .or(z.literal('')),
    password2: z
      .string()
      .min(6, 'A senha precisa ter pelo menos 6 caracteres.')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (!data.password && !data.password2) return true;
      return data.password === data.password2;
    },
    {
      message: 'As senhas não são iguais.',
      path: ['password2'],
    },
  )
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização.',
    path: ['message'],
  });

export const UserListSchema = z.array(UserResponseSchema);

export const LoginSchema = z.object(
  {
    email: z.email('Insira um email válido.'),
    password: z.string().min(1, 'Insira sua senha.'),
  },
  {
    message: 'Insira os campos necessários.',
  },
);

// --- Category Schemas ---

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

// --- Reimbursement Request Schemas ---

export const ReimbursementRequestSchema = z.object(
  {
    description: z
      .string('A descrição é obrigatória.')
      .min(5, 'A descrição deve ter pelo menos 5 caracteres.'),
    amount: z
      .number('Insira o valor.')
      .positive('O valor deve ser maior que zero.'),
    expenseDate: z.string().min(1, 'A data da despesa é obrigatória.').refine(
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
    expenseDate: z.string()
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

// --- Common Schemas ---

export const uuidParam = z.object({
  id: z.uuid('ID inválido.'),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const User = UserRegistrationSchema;

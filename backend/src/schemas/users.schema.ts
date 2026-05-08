import { z } from 'zod';
export const RoleEnum = z.enum([
  'COLABORADOR',
  'GESTOR',
  'FINANCEIRO',
  'ADMIN',
]);

export const UserRegistrationSchema = z
  .object({
    email: z.email('Formato de email, inválido.'),
    password: z.string().min(3, 'A senha precisa ter pelo menos 3 caracteres.'),
    password2: z
      .string()
      .min(3, 'A senha precisa ter pelo menos 3 caracteres.'),
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    role: RoleEnum.default('COLABORADOR'),
    active: z.boolean().default(true),
  })
  .refine((data) => data.password === data.password2, {
    message: 'As senhas não são iguais.',
    path: ['password2'],
  });

export const UserAdminUpdateSchema = z
  .object({
    role: RoleEnum.optional(),
    active: z.boolean().optional(),
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

export const UserResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  active: z.boolean(),
  role: RoleEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
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
export const User = UserRegistrationSchema;

import { z } from 'zod';

// Login
export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginForm = z.infer<typeof loginSchema>;

// Register or Updated User
export const userSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
    email: z.email('E-mail inválido').nonempty('O e-mail é obrigatório'),
    role: z.enum(
      ['COLABORADOR', 'GESTOR', 'FINANCEIRO', 'ADMIN'],
      'O perfil é obrigatório',
    ),
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres')
      .optional()
      .or(z.literal('')),
    password2: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.password2, {
    message: 'As senhas não coincidem',
    path: ['password2'],
  });

export type UserFormData = z.infer<typeof userSchema>;

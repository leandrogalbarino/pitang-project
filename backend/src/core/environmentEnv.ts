import z from 'zod';
import '../config/env.config';

const environmentSchema = z.object({
  DATABASE_URL: z.string({
    message: 'DATABASE_URL é obrigatória no arquivo .env',
  }),
  JWT_PRIVATE_KEY: z.string({
    message: 'JWT_PRIVATE_KEY é obrigatória no arquivo .env',
  }),
  HTTP_PORT: z.coerce.number().default(3000),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const result = environmentSchema.safeParse(process.env);

if (!result.success) {
  console.error('Erro de configuração nas variáveis de ambiente:');
  console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export const environment = result.data;

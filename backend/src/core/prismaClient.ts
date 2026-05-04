import 'dotenv/config';
import { PrismaClient } from '../../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Instância do Prisma Client configurada com o adaptador do PostgreSQL.
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

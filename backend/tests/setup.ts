import { prisma } from '../src/core/prismaClient';

beforeAll(async () => {
  // Verificação de segurança para não apagar banco de produção
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Testes devem rodar com NODE_ENV=test');
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

export const clearDatabase = async () => {
  // Ordem importa por causa das foreign keys
  await prisma.requestHistory.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.reimbursementRequest.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
};

import { Role } from '../generated/prisma';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { prisma } from '../src/core/prismaClient';

// Criar categorias.
const createCategories = async () => {
  try {
    console.log('Iniciando seed...');

    const categories = [
      { name: 'Alimentação', amountMax: 500 },
      { name: 'Transporte', amountMax: 300 },
      { name: 'Hospedagem', amountMax: 2000 },
      { name: 'Viagem', amountMax: 2000 },
      { name: 'Comida', amountMax: 500 },
      { name: 'Materias de Construção', amountMax: 2000 },
      { name: 'Diária', amountMax: 2000 },
      { name: 'Eletronicos', amountMax: 2000 },
      { name: 'Cosmeticos', amountMax: 2000 },
      { name: 'Outros', amountMax: 1000 },
    ];

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { name: cat.name },
        update: { amountMax: cat.amountMax },
        create: { 
          name: cat.name,
          amountMax: cat.amountMax
        },
      });
    }
    console.log('Categorias criadas.');
  } catch (error) {
    throw error;
  }
};

// Criar Usuários para cada Role
const createUsers = async () => {
  const saltRounds = 10;
  const password = await bcrypt.hash('pitang123', saltRounds);

  try {
    const users = [
      {
        email: 'admin@pitang.com',
        name: 'Admin Pitang',
        role: Role.ADMIN,
      },
      {
        email: 'gestor@pitang.com',
        name: 'Gestor Pitang',
        role: Role.GESTOR,
      },
      {
        email: 'financeiro@pitang.com',
        name: 'Financeiro Pitang',
        role: Role.FINANCEIRO,
      },
      {
        email: 'colaborador@pitang.com',
        name: 'Colaborador Pitang',
        role: Role.COLABORADOR,
      },
    ];

    for (const user of users) {
      await prisma.user.upsert({
        where: { email: user.email },
        update: { role: user.role },
        create: {
          email: user.email,
          name: user.name,
          password: password,
          role: user.role,
        },
      });
    }

    console.log('Usuários criados:');
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  try {
    await Promise.all([createCategories(), createUsers()]);
    console.log('Seed finalizado com sucesso!');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Erro ao criar a seed:', error.message);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
};

await main();

import request from 'supertest';
import app from '../src/server';
import { clearDatabase } from './setup';
import { prisma } from '../src/core/prismaClient';
import { generateToken } from './utils';

describe('Dashboard Endpoints', () => {
  let colaborador1Token: string;
  let colaborador2Token: string;
  let gestorToken: string;
  let adminToken: string;
  let colaborador1Id: string;
  let colaborador2Id: string;
  let category1Id: string;
  let category2Id: string;

  beforeEach(async () => {
    await clearDatabase();

    const cat1 = await prisma.category.create({
      data: { name: 'Viagem', amountMax: 1000 },
    });
    const cat2 = await prisma.category.create({
      data: { name: 'Alimentação', amountMax: 500 },
    });
    category1Id = cat1.id;
    category2Id = cat2.id;

    const colab1 = await prisma.user.create({
      data: { name: 'Colab 1', email: 'colab1@test.com', password: 'hash', role: 'COLABORADOR' },
    });
    const colab2 = await prisma.user.create({
      data: { name: 'Colab 2', email: 'colab2@test.com', password: 'hash', role: 'COLABORADOR' },
    });
    const gestor = await prisma.user.create({
      data: { name: 'Gestor', email: 'gestor@test.com', password: 'hash', role: 'GESTOR' },
    });
    const admin = await prisma.user.create({
      data: { name: 'Admin', email: 'admin@test.com', password: 'hash', role: 'ADMIN' },
    });

    colaborador1Id = colab1.id;
    colaborador2Id = colab2.id;
    colaborador1Token = generateToken(colab1);
    colaborador2Token = generateToken(colab2);
    gestorToken = generateToken(gestor);
    adminToken = generateToken(admin);

    // Criar Reembolsos
    // Colab 1: 1 Pago (100), 1 Enviado (50), 1 Rascunho (30)
    await prisma.reimbursementRequest.createMany({
      data: [
        { description: 'Hotel', amount: 100, expenseDate: new Date(), status: 'PAGO', userId: colaborador1Id, categoryId: category1Id },
        { description: 'Almoço', amount: 50, expenseDate: new Date(), status: 'ENVIADO', userId: colaborador1Id, categoryId: category2Id },
        { description: 'Uber', amount: 30, expenseDate: new Date(), status: 'RASCUNHO', userId: colaborador1Id, categoryId: category1Id },
      ],
    });

    // Colab 2: 1 Aprovado (200), 1 Rejeitado (80)
    await prisma.reimbursementRequest.createMany({
      data: [
        { description: 'Voo', amount: 200, expenseDate: new Date(), status: 'APROVADO', userId: colaborador2Id, categoryId: category1Id },
        { description: 'Jantar', amount: 80, expenseDate: new Date(), status: 'REJEITADO', userId: colaborador2Id, categoryId: category2Id },
      ],
    });
  });

  it('Deve retornar estatísticas apenas do próprio usuário para COLABORADOR', async () => {
    const res = await request(app)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${colaborador1Token}`);

    expect(res.status).toBe(200);

    expect(res.body.data.totalRequests).toBe(3);

    // totalAmount: PAGO(100) + ENVIADO(50) = 150 (Ignora RASCUNHO, REJEITADO e CANCELADO)
    expect(res.body.data.totalAmount).toBe(150);
    expect(res.body.data.paid).toBe(1);
    expect(res.body.data.pendingApproval).toBe(1);
  });

  it('Deve retornar estatísticas consolidadas para GESTOR', async () => {
    const res = await request(app)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${gestorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalRequests).toBe(5);
    // totalAmount: 100 + 50 + 200 = 350 (Ignora Rascunho de 30 e Rejeitado de 80)
    expect(res.body.data.totalAmount).toBe(350);
    expect(res.body.data.paid).toBe(1);
    expect(res.body.data.pendingApproval).toBe(1);
    expect(res.body.data.pendingPayment).toBe(1);
  });

  it('Deve retornar estatísticas consolidadas para ADMIN', async () => {
    const res = await request(app)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalRequests).toBe(5);
  });

  it('Deve agrupar corretamente por categoria no dashboard', async () => {
    const res = await request(app)
      .get('/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    // Category 1 (Viagem): 100 (Pago) + 200 (Aprovado) = 300. (Rascunho de 30 é ignorado na query de categoria por status: { notIn: ['CANCELADO', 'RASCUNHO'] })
    // Category 2 (Alimentação): 50 (Enviado). (Rejeitado de 80 é ignorado na query de categoria)
    
    const viagem = res.body.data.byCategory.find((c: any) => c.name === 'Viagem');
    const alimentacao = res.body.data.byCategory.find((c: any) => c.name === 'Alimentação');

    expect(viagem.total).toBe(300);
    expect(alimentacao.total).toBe(50);
  });
});

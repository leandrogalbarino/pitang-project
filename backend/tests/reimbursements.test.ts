import request from 'supertest';
import app from '../src/server';
import { clearDatabase } from './setup';
import { prisma } from '../src/core/prismaClient';
import { generateToken } from './utils';

describe('Reimbursement Flow', () => {
  let colaboradorToken: string;
  let gestorToken: string;
  let colaboradorId: string;
  let gestorId: string;
  let categoryId: string;

  beforeEach(async () => {
    await clearDatabase();

    const colaborador = await prisma.user.create({
      data: {
        name: 'Colaborador',
        email: 'colab@test.com',
        password: 'hash',
        role: 'COLABORADOR',
      },
    });
    colaboradorId = colaborador.id;
    colaboradorToken = generateToken(colaborador);

    const gestor = await prisma.user.create({
      data: {
        name: 'Gestor',
        email: 'gestor@test.com',
        password: 'hash',
        role: 'GESTOR',
      },
    });
    gestorId = gestor.id;
    gestorToken = generateToken(gestor);

    const category = await prisma.category.create({
      data: { name: 'Viagem', active: true },
    });
    categoryId = category.id;
  });

  it('Deve criar uma solicitação de reembolso como colaborador', async () => {
    const res = await request(app)
      .post('/reimbursements')
      .set('Authorization', `Bearer ${colaboradorToken}`)
      .send({
        description: 'Voo para SP',
        amount: 500,
        expenseDate: new Date(),
        categoryId: categoryId,
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Solicitação criada com sucesso.');

    const requests = await prisma.reimbursementRequest.findMany();
    expect(requests.length).toBe(1);
    expect(requests[0]?.status).toBe('RASCUNHO');
  });

  it('Não deve permitir que um gestor crie um reembolso', async () => {
    const res = await request(app)
      .post('/reimbursements')
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({
        description: 'Voo para SP',
        amount: 500,
        expenseDate: new Date(),
        categoryId: categoryId,
      });

    expect(res.status).toBe(403);
  });

  it('Deve permitir que um colaborador envie uma solicitação', async () => {
    const reimbursement = await prisma.reimbursementRequest.create({
      data: {
        description: 'Teste',
        amount: 100,
        expenseDate: new Date(),
        userId: colaboradorId,
        categoryId: categoryId,
        status: 'RASCUNHO',
      },
    });

    const res = await request(app)
      .post(`/reimbursements/${reimbursement.id}/submit`)
      .set('Authorization', `Bearer ${colaboradorToken}`);

    expect(res.status).toBe(200);

    const updated = await prisma.reimbursementRequest.findUnique({
      where: { id: reimbursement.id },
    });
    expect(updated?.status).toBe('ENVIADO');
  });

  it('Deve permitir que o gestor aprove uma solicitação enviada', async () => {
    const reimbursement = await prisma.reimbursementRequest.create({
      data: {
        description: 'Teste',
        amount: 100,
        expenseDate: new Date(),
        userId: colaboradorId,
        categoryId: categoryId,
        status: 'ENVIADO',
      },
    });

    const res = await request(app)
      .post(`/reimbursements/${reimbursement.id}/approve`)
      .set('Authorization', `Bearer ${gestorToken}`);

    expect(res.status).toBe(200);

    const updated = await prisma.reimbursementRequest.findUnique({
      where: { id: reimbursement.id },
    });
    expect(updated?.status).toBe('APROVADO');
  });

  it('Deve permitir que o gestor rejeite uma solicitação enviada com justificativa', async () => {
    const reimbursement = await prisma.reimbursementRequest.create({
      data: {
        description: 'Teste',
        amount: 100,
        expenseDate: new Date(),
        userId: colaboradorId,
        categoryId: categoryId,
        status: 'ENVIADO',
      },
    });

    const res = await request(app)
      .post(`/reimbursements/${reimbursement.id}/reject`)
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({ rejectionDescription: 'Documentação incompleta' });

    expect(res.status).toBe(200);

    const updated = await prisma.reimbursementRequest.findUnique({
      where: { id: reimbursement.id },
    });
    expect(updated?.status).toBe('REJEITADO');
    expect(updated?.rejectionDescription).toBe('Documentação incompleta');
  });
});

import request from 'supertest';
import app from '../src/server';
import { clearDatabase } from './setup';
import { prisma } from '../src/core/prismaClient';
import { generateToken } from './utils';
import dayjs from 'dayjs';

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
      data: { name: 'Viagem', active: true, amountMax: 1000 },
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
        expenseDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
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
        expenseDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
        categoryId: categoryId,
      });

    expect(res.status).toBe(403);
  });

  it('Deve permitir que um colaborador envie uma solicitação', async () => {
    const reimbursement = await prisma.reimbursementRequest.create({
      data: {
        description: 'Teste',
        amount: 100,
        expenseDate: dayjs().subtract(1, 'day').toDate(),
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
        expenseDate: dayjs().subtract(1, 'day').toDate(),
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
        expenseDate: dayjs().subtract(1, 'day').toDate(),
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

  it('Deve permitir que o financeiro pague uma solicitação aprovada', async () => {
    const financeiro = await prisma.user.create({
      data: {
        name: 'Financeiro',
        email: 'fin@test.com',
        password: 'hash',
        role: 'FINANCEIRO',
      },
    });
    const financeiroToken = generateToken(financeiro);

    const reimbursement = await prisma.reimbursementRequest.create({
      data: {
        description: 'Voo aprovado',
        amount: 500,
        expenseDate: dayjs().subtract(1, 'day').toDate(),
        userId: colaboradorId,
        categoryId: categoryId,
        status: 'APROVADO',
      },
    });

    const res = await request(app)
      .post(`/reimbursements/${reimbursement.id}/pay`)
      .set('Authorization', `Bearer ${financeiroToken}`);

    expect(res.status).toBe(200);

    const updated = await prisma.reimbursementRequest.findUnique({
      where: { id: reimbursement.id },
    });
    expect(updated?.status).toBe('PAGO');

    const history = await prisma.requestHistory.findFirst({
      where: { requestId: reimbursement.id, action: 'PAID' },
    });
    expect(history).toBeDefined();
  });

  it('Não deve permitir que o financeiro pague uma solicitação que não está aprovada', async () => {
    const financeiro = await prisma.user.create({
      data: {
        name: 'Financeiro 2',
        email: 'fin2@test.com',
        password: 'hash',
        role: 'FINANCEIRO',
      },
    });
    const financeiroToken = generateToken(financeiro);

    const reimbursement = await prisma.reimbursementRequest.create({
      data: {
        description: 'Voo pendente',
        amount: 500,
        expenseDate: dayjs().subtract(1, 'day').toDate(),
        userId: colaboradorId,
        categoryId: categoryId,
        status: 'ENVIADO',
      },
    });

    const res = await request(app)
      .post(`/reimbursements/${reimbursement.id}/pay`)
      .set('Authorization', `Bearer ${financeiroToken}`);

    expect(res.status).toBe(400);
  });

  it('Não deve permitir que ADMIN ou FINANCEIRO criem solicitações', async () => {
    const admin = await prisma.user.create({
      data: { name: 'Admin', email: 'admin_reim@test.com', password: 'hash', role: 'ADMIN' },
    });
    const financeiro = await prisma.user.create({
      data: { name: 'Fin', email: 'fin_reim@test.com', password: 'hash', role: 'FINANCEIRO' },
    });

    const adminToken = generateToken(admin);
    const financeiroToken = generateToken(financeiro);

    const payload = { description: 'Teste', amount: 100, expenseDate: dayjs().subtract(1, "day").format("YYYY-MM-DD"), categoryId };

    const resAdmin = await request(app).post('/reimbursements').set('Authorization', `Bearer ${adminToken}`).send(payload);
    const resFin = await request(app).post('/reimbursements').set('Authorization', `Bearer ${financeiroToken}`).send(payload);

    expect(resAdmin.status).toBe(403);
    expect(resFin.status).toBe(403);
  });

  it('Não deve permitir que o Colaborador aceite ou recuse uma solicitação', async () => {
    const reimbursement = await prisma.reimbursementRequest.create({
      data: { description: 'Voo', amount: 500, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'ENVIADO' },
    });

    const resApprove = await request(app).post(`/reimbursements/${reimbursement.id}/approve`).set('Authorization', `Bearer ${colaboradorToken}`);
    const resReject = await request(app).post(`/reimbursements/${reimbursement.id}/reject`).set('Authorization', `Bearer ${colaboradorToken}`).send({ rejectionDescription: 'Hack' });

    expect(resApprove.status).toBe(403);
    expect(resReject.status).toBe(403);
  });

  it('O gestor não deve conseguir rejeitar sem uma justificativa', async () => {
    const reimbursement = await prisma.reimbursementRequest.create({
      data: { description: 'Voo', amount: 500, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'ENVIADO' },
    });

    const res = await request(app)
      .post(`/reimbursements/${reimbursement.id}/reject`)
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({}); // Sem justificativa

    expect(res.status).toBe(400);
  });

  it('Apenas o financeiro pode pagar, nenhum outro perfil pode', async () => {
    const admin = await prisma.user.create({
      data: { name: 'Admin', email: 'admin_pay@test.com', password: 'hash', role: 'ADMIN' },
    });
    const adminToken = generateToken(admin);

    const reimbursement = await prisma.reimbursementRequest.create({
      data: { description: 'Aprovado', amount: 500, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'APROVADO' },
    });

    // Testando Colaborador pagando
    const resColab = await request(app).post(`/reimbursements/${reimbursement.id}/pay`).set('Authorization', `Bearer ${colaboradorToken}`);
    // Testando Gestor pagando
    const resGestor = await request(app).post(`/reimbursements/${reimbursement.id}/pay`).set('Authorization', `Bearer ${gestorToken}`);
    // Testando Admin pagando
    const resAdmin = await request(app).post(`/reimbursements/${reimbursement.id}/pay`).set('Authorization', `Bearer ${adminToken}`);

    expect(resColab.status).toBe(403);
    expect(resGestor.status).toBe(403);
    expect(resAdmin.status).toBe(403);
  });

  describe('Visibilidade e Filtros de Perfil', () => {
    it('Deve validar a visibilidade correta para cada perfil', async () => {
      // 1. Setup de usuários adicionais
      const colabB = await prisma.user.create({
        data: { name: 'Colab B', email: 'colab_b@test.com', password: 'hash', role: 'COLABORADOR' },
      });
      const financeiro = await prisma.user.create({
        data: { name: 'Financeiro', email: 'fin_vis@test.com', password: 'hash', role: 'FINANCEIRO' },
      });
      const admin = await prisma.user.create({
        data: { name: 'Admin', email: 'admin_vis@test.com', password: 'hash', role: 'ADMIN' },
      });

      const colabBToken = generateToken(colabB);
      const financeiroToken = generateToken(financeiro);
      const adminToken = generateToken(admin);

      // 2. Criar massa de dados
      // R1: Colaborador A - RASCUNHO
      await prisma.reimbursementRequest.create({
        data: { description: 'R1', amount: 10, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'RASCUNHO' },
      });
      // R2: Colaborador A - ENVIADO
      await prisma.reimbursementRequest.create({
        data: { description: 'R2', amount: 20, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'ENVIADO' },
      });
      // R3: Colaborador B - ENVIADO
      await prisma.reimbursementRequest.create({
        data: { description: 'R3', amount: 30, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colabB.id, categoryId, status: 'ENVIADO' },
      });
      // R4: Colaborador B - APROVADO
      await prisma.reimbursementRequest.create({
        data: { description: 'R4', amount: 40, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colabB.id, categoryId, status: 'APROVADO' },
      });

      // 3. Testar Colaborador A (Deve ver 2: R1 e R2)
      const resColab = await request(app).get('/reimbursements').set('Authorization', `Bearer ${colaboradorToken}`);
      expect(resColab.body.data.pagination.total).toBe(2);

      // 4. Testar Colaborador B (Deve ver 2: R3 e R4)
      const resColabB = await request(app).get('/reimbursements').set('Authorization', `Bearer ${colabBToken}`);
      expect(resColabB.body.data.pagination.total).toBe(2);

      // 5. Testar Gestor (Deve ver 2: R2 e R3 - os ENVIADOS)
      const resGestor = await request(app).get('/reimbursements').set('Authorization', `Bearer ${gestorToken}`);
      expect(resGestor.body.data.pagination.total).toBe(2);

      // 5. Testar Financeiro (Deve ver 1: R4 - o APROVADO)
      const resFin = await request(app).get('/reimbursements').set('Authorization', `Bearer ${financeiroToken}`);
      expect(resFin.body.data.pagination.total).toBe(1);

      // 6. Testar Admin (Deve ver 4: Tudo)
      const resAdmin = await request(app).get('/reimbursements').set('Authorization', `Bearer ${adminToken}`);
      expect(resAdmin.body.data.pagination.total).toBe(4);
    });
  });

  describe('Queries e Paginação', () => {
    let adminToken: string;

    beforeEach(async () => {
      // Usar o Admin para ter visão total nos testes de filtro
      const admin = await prisma.user.create({
        data: { name: 'Admin Filter', email: 'admin_filter@test.com', password: 'hash', role: 'ADMIN' },
      });
      adminToken = generateToken(admin);
    });

    it('Deve paginar os resultados corretamente', async () => {
      // Criar 12 registros
      for (let i = 1; i <= 12; i++) {
        await prisma.reimbursementRequest.create({
          data: { description: `Req ${i}`, amount: i * 10, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'ENVIADO' },
        });
      }

      const res = await request(app)
        .get('/reimbursements?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.data.length).toBe(5);
      expect(res.body.data.pagination.total).toBe(12);
      expect(res.body.data.pagination.totalPages).toBe(3);
    });

    it('Deve filtrar por nome de usuário (search)', async () => {
      const userAlice = await prisma.user.create({
        data: { name: 'Alice Silva', email: 'alice@test.com', password: 'hash', role: 'COLABORADOR' },
      });
      
      await prisma.reimbursementRequest.create({
        data: { description: 'Taxi Alice', amount: 50, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: userAlice.id, categoryId, status: 'ENVIADO' },
      });
      await prisma.reimbursementRequest.create({
        data: { description: 'Taxi Outro', amount: 50, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'ENVIADO' },
      });

      const res = await request(app)
        .get('/reimbursements?search=Alice')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.data.length).toBe(1);
      expect(res.body.data.data[0].user.name).toBe('Alice Silva');
    });

    it('Deve filtrar por nome de categoria', async () => {
      const catAlmoco = await prisma.category.create({ data: { name: 'Almoço', active: true, amountMax: 100 } });
      
      await prisma.reimbursementRequest.create({
        data: { description: 'Almoço VIP', amount: 100, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId: catAlmoco.id, status: 'ENVIADO' },
      });

      const res = await request(app)
        .get('/reimbursements?category=Almoço')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.data.length).toBe(1);
      expect(res.body.data.data[0].category.name).toBe('Almoço');
    });

    it('Deve ordenar por valor (amount) decrescente', async () => {
      await prisma.reimbursementRequest.create({
        data: { description: 'Barato', amount: 10, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'ENVIADO' },
      });
      await prisma.reimbursementRequest.create({
        data: { description: 'Caro', amount: 1000, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'ENVIADO' },
      });

      const res = await request(app)
        .get('/reimbursements?order=amount&orderDirection=desc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.data[0].amount).toBe(1000);
      expect(res.body.data.data[1].amount).toBe(10);
    });

    it('Deve ordenar por data (expenseDate) decrescente', async () => {
      const dateAntiga = new Date('2023-01-01');
      const dateNova = new Date('2023-12-31');

      await prisma.reimbursementRequest.create({
        data: { description: 'Antiga', amount: 10, expenseDate: dateAntiga, userId: colaboradorId, categoryId, status: 'ENVIADO' },
      });
      await prisma.reimbursementRequest.create({
        data: { description: 'Nova', amount: 10, expenseDate: dateNova, userId: colaboradorId, categoryId, status: 'ENVIADO' },
      });

      const res = await request(app)
        .get('/reimbursements?order=date&orderDirection=desc')
        .set('Authorization', `Bearer ${adminToken}`);

      // O mais recente deve vir primeiro no DESC
      expect(new Date(res.body.data.data[0].expenseDate).getTime()).toBe(dateNova.getTime());
    });

    it('Deve filtrar por status específico', async () => {
      await prisma.reimbursementRequest.create({
        data: { description: 'Aprovada', amount: 10, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'APROVADO' },
      });
      await prisma.reimbursementRequest.create({
        data: { description: 'Rejeitada', amount: 10, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'REJEITADO' },
      });

      const res = await request(app)
        .get('/reimbursements?status=APROVADO')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.data.length).toBe(1);
      expect(res.body.data.data[0].status).toBe('APROVADO');
    });

    it('Deve registrar o histórico corretamente em cada etapa', async () => {
      // 1. Criar
      const reimbursement = await prisma.reimbursementRequest.create({
        data: { description: 'Audit', amount: 100, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'RASCUNHO' }
      });

      // 2. Enviar
      await request(app).post(`/reimbursements/${reimbursement.id}/submit`).set('Authorization', `Bearer ${colaboradorToken}`);
      let history = await prisma.requestHistory.findFirst({ where: { requestId: reimbursement.id, action: 'SUBMITTED' } });
      expect(history).toBeDefined();
      expect(history?.userId).toBe(colaboradorId);

      // 3. Aprovar
      await request(app).post(`/reimbursements/${reimbursement.id}/approve`).set('Authorization', `Bearer ${gestorToken}`);
      history = await prisma.requestHistory.findFirst({ where: { requestId: reimbursement.id, action: 'APPROVED' } });
      expect(history).toBeDefined();
      expect(history?.userId).toBe(gestorId);

      // 4. Pagar
      const financeiro = await prisma.user.create({ data: { name: 'Fin', email: 'fin_audit@test.com', password: 'hash', role: 'FINANCEIRO' } });
      const finToken = generateToken(financeiro);
      await request(app).post(`/reimbursements/${reimbursement.id}/pay`).set('Authorization', `Bearer ${finToken}`);
      
      history = await prisma.requestHistory.findFirst({ where: { requestId: reimbursement.id, action: 'PAID' } });
      expect(history).toBeDefined();
      expect(history?.userId).toBe(financeiro.id);
    });

    it('Deve permitir editar uma solicitação em rascunho', async () => {
      const reimbursement = await prisma.reimbursementRequest.create({
        data: { description: 'Old Desc', amount: 10, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'RASCUNHO' }
      });

      const res = await request(app)
        .put(`/reimbursements/${reimbursement.id}`)
        .set('Authorization', `Bearer ${colaboradorToken}`)
        .send({ description: 'New Desc', amount: 99 });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('New Desc');
      expect(res.body.data.amount).toBe(99);
    });

    it('Deve permitir cancelar uma solicitação em rascunho', async () => {
      const reimbursement = await prisma.reimbursementRequest.create({
        data: { description: 'To Cancel', amount: 10, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'RASCUNHO' }
      });

      const res = await request(app)
        .post(`/reimbursements/${reimbursement.id}/cancel`)
        .set('Authorization', `Bearer ${colaboradorToken}`);

      expect(res.status).toBe(200);
      const updated = await prisma.reimbursementRequest.findUnique({ where: { id: reimbursement.id } });
      expect(updated?.status).toBe('CANCELADO');
    });

    it('Deve retornar o histórico de uma solicitação via API', async () => {
      const reimbursement = await prisma.reimbursementRequest.create({
        data: { description: 'Hist', amount: 10, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'RASCUNHO' }
      });
      await prisma.requestHistory.create({
        data: { requestId: reimbursement.id, userId: colaboradorId, action: 'CREATED' }
      });

      const res = await request(app)
        .get(`/reimbursements/${reimbursement.id}/history`)
        .set('Authorization', `Bearer ${colaboradorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Deve retornar os anexos de uma solicitação via API', async () => {
      const reimbursement = await prisma.reimbursementRequest.create({
        data: { description: 'Att', amount: 10, expenseDate: dayjs().subtract(1, 'day').toDate(), userId: colaboradorId, categoryId, status: 'RASCUNHO' }
      });
      await prisma.attachment.create({
        data: { requestId: reimbursement.id, fileName: 'test.png', fileUrl: 'url', fileType: 'image/png' }
      });

      const res = await request(app)
        .get(`/reimbursements/${reimbursement.id}/attachments`)
        .set('Authorization', `Bearer ${colaboradorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });
  });
});

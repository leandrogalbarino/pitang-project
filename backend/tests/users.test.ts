import request from 'supertest';
import app from '../src/server';
import { clearDatabase } from './setup';
import { prisma } from '../src/core/prismaClient';
import { generateToken } from './utils';

describe('Users Endpoints', () => {
  let adminToken: string;

  beforeEach(async () => {
    await clearDatabase();
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'hashed_password',
        role: 'ADMIN',
      },
    });
    adminToken = generateToken(admin);
  });

  it('Deve criar um novo usuário como admin', async () => {
    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
        password2: 'password123',
        role: 'COLABORADOR',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('New User');

    const user = await prisma.user.findUnique({
      where: { email: 'new@test.com' },
    });
    expect(user).toBeDefined();
    expect(user?.role).toBe('COLABORADOR');
    expect(user?.password).not.toEqual('password123');
  });

  it('Deve listar todos os usuários como admin', async () => {
    await prisma.user.create({
      data: {
        name: 'Colab 1',
        email: 'colab1@test.com',
        password: 'password123',
        role: 'COLABORADOR',
      },
    });

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.data.length).toBe(2);
  });

  it('Deve editar um usuário', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Old Name',
        email: 'old@test.com',
        password: 'hash',
        role: 'COLABORADOR',
      },
    });

    const res = await request(app)
      .patch(`/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Joaquim',
        role: 'GESTOR',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.role).toBe('GESTOR');
    expect(res.body.data.name).toBe('Old Name');

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.role).toBe('GESTOR');
    expect(updated?.name).toBe('Old Name');
  });

  it('Deve desativar(soft delete) um usuário', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Pitang Desafio',
        email: 'amigo@test.com',
        password: 'pitang123',
        role: 'COLABORADOR',
      },
    });

    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);

    const deletedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(deletedUser?.active).toBe(false);
  });

  it('Não deve permitir que um não-admin crie usuários', async () => {
    const colab = await prisma.user.create({
      data: {
        name: 'Colab',
        email: 'colab@test.com',
        password: 'hash',
        role: 'COLABORADOR',
      },
    });
    const colabToken = generateToken(colab);

    const res = await request(app)
      .post('/users')
      .set('Authorization', `Bearer ${colabToken}`)
      .send({
        name: 'Unauthorized',
        email: 'unauthorized@test.com',
        password: 'password123',
        role: 'COLABORADOR',
      });

    expect(res.status).toBe(403);
  });

  it('Não deve permitir que um colaborador edite outro usuário', async () => {
    const colab1 = await prisma.user.create({
      data: {
        name: 'Colab 1',
        email: 'c1@test.com',
        password: 'hash',
        role: 'COLABORADOR',
      },
    });
    const colab2 = await prisma.user.create({
      data: {
        name: 'Colab 2',
        email: 'c2@test.com',
        password: 'hash',
        role: 'COLABORADOR',
      },
    });
    const colab1Token = generateToken(colab1);

    const res = await request(app)
      .patch(`/users/${colab2.id}`)
      .set('Authorization', `Bearer ${colab1Token}`)
      .send({ name: 'Hacker' });

    expect(res.status).toBe(403);
  });

  it('Não deve permitir que um colaborador desative outro usuário', async () => {
    const colab1 = await prisma.user.create({
      data: {
        name: 'Colab 1',
        email: 'c1_del@test.com',
        password: 'hash',
        role: 'COLABORADOR',
      },
    });
    const colab2 = await prisma.user.create({
      data: {
        name: 'Colab 2',
        email: 'c2_del@test.com',
        password: 'hash',
        role: 'COLABORADOR',
      },
    });
    const colab1Token = generateToken(colab1);

    const res = await request(app)
      .delete(`/users/${colab2.id}`)
      .set('Authorization', `Bearer ${colab1Token}`);

    expect(res.status).toBe(403);
  });

  it('Deve permitir que um usuário altere seus próprios dados, mas não sua role', async () => {
    const user = await prisma.user.create({
      data: {
        name: 'Self',
        email: 'self@test.com',
        password: 'hash',
        role: 'COLABORADOR',
      },
    });
    const userToken = generateToken(user);

    const res = await request(app)
      .patch(`/users/${user.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Self Updated',
        email: 'self_new@test.com',
        role: 'ADMIN',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Self Updated');
    expect(res.body.data.role).toBe('COLABORADOR'); // Role NÃO deve mudar

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    expect(updated?.name).toBe('Self Updated');
    expect(updated?.role).toBe('COLABORADOR');
  });

  describe('Queries e Paginação', () => {
    it('Deve paginar a listagem de usuários', async () => {
      // Criar 12 usuários colab
      for (let i = 1; i <= 12; i++) {
        await prisma.user.create({
          data: { name: `User ${i}`, email: `user${i}@test.com`, password: 'hash', role: 'COLABORADOR' },
        });
      }

      const res = await request(app)
        .get('/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.data.length).toBe(5);
      expect(res.body.data.pagination.total).toBe(13); // 12 novos + 1 admin do beforeEach
    });

    it('Deve filtrar usuários por nome ou email (search)', async () => {
      await prisma.user.create({
        data: { name: 'Marcos Oliveira', email: 'marcos@test.com', password: 'hash', role: 'COLABORADOR' },
      });

      const resName = await request(app)
        .get('/users?search=Marcos')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(resName.body.data.data[0].name).toBe('Marcos Oliveira');

      const resEmail = await request(app)
        .get('/users?search=marcos@test')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(resEmail.body.data.data[0].email).toBe('marcos@test.com');
    });
  });
});

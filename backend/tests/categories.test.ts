import request from 'supertest';
import app from '../src/server';
import { clearDatabase } from './setup';
import { prisma } from '../src/core/prismaClient';
import { generateToken } from './utils';

describe('Categories Endpoints', () => {
  let adminToken: string;

  beforeEach(async () => {
    await clearDatabase();
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@test.com',
        password: 'hash',
        role: 'ADMIN',
      },
    });
    adminToken = generateToken(admin);
  });

  it('Deve listar as categorias', async () => {
    await prisma.category.create({
      data: { name: 'Alimentação', active: true, amountMax: 500 },
    });

    const res = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    // Categorias usam paginação, então acessamos data.data
    expect(res.body.data.data.length).toBe(1);
    expect(res.body.data.data[0].name).toBe('Alimentação');
  });

  it('Deve criar uma categoria como admin', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Transporte', amountMax: 200 });

    expect(res.status).toBe(201);

    const category = await prisma.category.findUnique({
      where: { name: 'Transporte' },
    });
    expect(category).toBeDefined();
  });

  it('Deve retornar 409 para nome de categoria duplicado', async () => {
    await prisma.category.create({
      data: { name: 'Transporte', active: true, amountMax: 200 },
    });

    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Transporte', amountMax: 200 });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Já existe uma categoria com este nome.');
  });

  it('Deve editar uma categoria como admin', async () => {
    const category = await prisma.category.create({
      data: { name: 'Old Category', active: true, amountMax: 100 },
    });

    const res = await request(app)
      .put(`/categories/${category.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Categoria Legal', active: false, amountMax: 300 });

    expect(res.status).toBe(200);

    const updated = await prisma.category.findUnique({
      where: { id: category.id },
    });
    expect(updated?.name).toBe('Categoria Legal');
    expect(updated?.active).toBe(false);
  });

  it('Deve excluir(soft delete) uma categoria como admin', async () => {
    const category = await prisma.category.create({
      data: { name: 'Soft delete', active: true, amountMax: 100 },
    });

    const res = await request(app)
      .delete(`/categories/${category.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(204);

    const deletedCategory = await prisma.category.findUnique({
      where: { id: category.id },
    });
    expect(deletedCategory?.active).toBe(false);
  });

  it('Não deve permitir que um colaborador crie, edite ou desative categorias', async () => {
    const colab = await prisma.user.create({
      data: { name: 'Colab', email: 'colab_cat@test.com', password: 'hash', role: 'COLABORADOR' },
    });
    const colabToken = generateToken(colab);

    const category = await prisma.category.create({
      data: { name: 'Existing', active: true, amountMax: 100 },
    });

    // Tentar criar
    const resCreate = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${colabToken}`)
      .send({ name: 'New Forbidden' });
    expect(resCreate.status).toBe(403);

    // Tentar editar
    const resUpdate = await request(app)
      .put(`/categories/${category.id}`)
      .set('Authorization', `Bearer ${colabToken}`)
      .send({ name: 'Updated Forbidden' });
    expect(resUpdate.status).toBe(403);

    // Tentar deletar
    const resDelete = await request(app)
      .delete(`/categories/${category.id}`)
      .set('Authorization', `Bearer ${colabToken}`);
    expect(resDelete.status).toBe(403);
  });

  describe('Queries e Paginação', () => {
    it('Deve paginar a listagem de categorias', async () => {
      // Criar 12 categorias
      for (let i = 1; i <= 12; i++) {
        await prisma.category.create({
          data: { name: `Cat ${i}`, active: true, amountMax: 100 * i },
        });
      }

      const res = await request(app)
        .get('/categories?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.data.length).toBe(5);
      expect(res.body.data.pagination.total).toBe(12);
    });

    it('Deve filtrar categorias por nome (search)', async () => {
      await prisma.category.create({
        data: { name: 'Viagem Internacional', active: true, amountMax: 5000 },
      });

      const res = await request(app)
        .get('/categories?search=Internacional')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.data.data[0].name).toBe('Viagem Internacional');
    });

    it('Deve buscar uma categoria específica pelo ID', async () => {
      const category = await prisma.category.create({
        data: { name: 'Single Cat', active: true, amountMax: 100 },
      });

      const res = await request(app)
        .get(`/categories/${category.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Single Cat');
    });
  });
});

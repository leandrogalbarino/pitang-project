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
      data: { name: 'Alimentação', active: true },
    });

    const res = await request(app)
      .get('/categories')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe('Alimentação');
  });

  it('Deve criar uma categoria como admin', async () => {
    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Transporte' });

    expect(res.status).toBe(201);

    const category = await prisma.category.findUnique({
      where: { name: 'Transporte' },
    });
    expect(category).toBeDefined();
  });

  it('Deve retornar 409 para nome de categoria duplicado', async () => {
    await prisma.category.create({
      data: { name: 'Transporte', active: true },
    });

    const res = await request(app)
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Transporte' });

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('Já existe uma categoria com este nome.');
  });
});

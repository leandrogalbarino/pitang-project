import request from 'supertest';
import app from '../src/server';
import { clearDatabase } from './setup';
import { prisma } from '../src/core/prismaClient';
import bcrypt from 'bcrypt';

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  it('Deve fazer login de um usuário existente', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: 'User Test',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com',
      password: password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('Deve retornar 404 para usuário inexistente', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'errado@exemplo.com',
      password: 'password123',
    });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Credenciais inválidas.');
  });
});

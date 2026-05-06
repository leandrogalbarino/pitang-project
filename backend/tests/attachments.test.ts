import request from 'supertest';
import app from '../src/server';
import { clearDatabase } from './setup';
import { prisma } from '../src/core/prismaClient';
import { generateToken } from './utils';
import path from 'node:path';
import fs from 'node:fs';

describe('Attachments (Files) Endpoints', () => {
  let colaboradorToken: string;
  let gestorToken: string;
  let colaboradorId: string;
  let reimbursementId: string;
  const testFilePath = path.resolve(__dirname, 'fixtures/test-image.png');
  const invalidFilePath = path.resolve(__dirname, 'fixtures/test-invalid.txt');

  beforeAll(() => {
    // Garantir que as fixtures existam
    const fixtureDir = path.resolve(__dirname, 'fixtures');
    if (!fs.existsSync(fixtureDir)) fs.mkdirSync(fixtureDir, { recursive: true });
    fs.writeFileSync(testFilePath, 'fake image content');
    fs.writeFileSync(invalidFilePath, 'fake text content');
  });

  afterAll(() => {
    // Limpar fixtures
    if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
    if (fs.existsSync(invalidFilePath)) fs.unlinkSync(invalidFilePath);
  });

  beforeEach(async () => {
    await clearDatabase();

    const colaborador = await prisma.user.create({
      data: { name: 'Colab', email: 'colab@test.com', password: 'hash', role: 'COLABORADOR' },
    });
    colaboradorId = colaborador.id;
    colaboradorToken = generateToken(colaborador);

    const gestor = await prisma.user.create({
      data: { name: 'Gestor', email: 'gestor@test.com', password: 'hash', role: 'GESTOR' },
    });
    gestorToken = generateToken(gestor);

    const category = await prisma.category.create({
      data: { name: 'Viagem', active: true, amountMax: 1000 },
    });

    const reimbursement = await prisma.reimbursementRequest.create({
      data: {
        description: 'Voo',
        amount: 100,
        expenseDate: new Date(),
        userId: colaboradorId,
        categoryId: category.id,
        status: 'RASCUNHO',
      },
    });
    reimbursementId = reimbursement.id;
  });

  it('Deve permitir que o colaborador anexe um arquivo válido (.png)', async () => {
    const res = await request(app)
      .post(`/reimbursements/${reimbursementId}/attachments`)
      .set('Authorization', `Bearer ${colaboradorToken}`)
      .attach('files', testFilePath);

    expect(res.status).toBe(200); // addAttachments retorna successData (200)

    const attachment = await prisma.attachment.findFirst({
      where: { requestId: reimbursementId },
    });
    expect(attachment).toBeDefined();
    expect(attachment?.fileName).toBe('test-image.png');
    
    // Limpar arquivo físico criado pelo teste
    const physicalName = attachment!.fileUrl.split('/uploads/').pop();
    if (physicalName) {
      const physicalPath = path.resolve(process.cwd(), 'uploads', physicalName);
      if (fs.existsSync(physicalPath)) fs.unlinkSync(physicalPath);
    }
  });

  it('Não deve permitir arquivos com extensões proibidas (.txt)', async () => {
    const res = await request(app)
      .post(`/reimbursements/${reimbursementId}/attachments`)
      .set('Authorization', `Bearer ${colaboradorToken}`)
      .attach('files', invalidFilePath);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Formato de arquivo não suportado');
  });

  it('Não deve permitir que um GESTOR anexe arquivos', async () => {
    const res = await request(app)
      .post(`/reimbursements/${reimbursementId}/attachments`)
      .set('Authorization', `Bearer ${gestorToken}`)
      .attach('files', testFilePath);

    expect(res.status).toBe(403);
  });

  it('Deve permitir que o colaborador remova seu próprio anexo (Hard Delete)', async () => {
    // 1. Criar um anexo manualmente no banco para testar a remoção
    const attachment = await prisma.attachment.create({
      data: {
        requestId: reimbursementId,
        fileName: 'to-delete.png',
        fileUrl: 'http://localhost:3000/uploads/to-delete-physical.png',
        fileType: 'image/png',
      },
    });

    // Criar o arquivo físico fake para testar a remoção
    const physicalPath = path.resolve(process.cwd(), 'uploads', 'to-delete-physical.png');
    if (!fs.existsSync(path.dirname(physicalPath))) fs.mkdirSync(path.dirname(physicalPath), { recursive: true });
    fs.writeFileSync(physicalPath, 'content');

    const res = await request(app)
      .delete(`/reimbursements/${reimbursementId}/attachments/${attachment.id}`)
      .set('Authorization', `Bearer ${colaboradorToken}`);

    expect(res.status).toBe(204);

    // Validar banco
    const deleted = await prisma.attachment.findUnique({ where: { id: attachment.id } });
    expect(deleted).toBeNull();

    // Validar remoção física
    expect(fs.existsSync(physicalPath)).toBe(false);
  });

  it('Não deve permitir que um usuário remova anexo de outro', async () => {
    const attachment = await prisma.attachment.create({
      data: {
        requestId: reimbursementId,
        fileName: 'other.png',
        fileUrl: 'http://localhost:3000/uploads/other.png',
        fileType: 'image/png',
      },
    });

    const otherColab = await prisma.user.create({
      data: { name: 'Other', email: 'other@test.com', password: 'hash', role: 'COLABORADOR' },
    });
    const otherToken = generateToken(otherColab);

    const res = await request(app)
      .delete(`/reimbursements/${reimbursementId}/attachments/${attachment.id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  it('Deve criar a pasta uploads caso ela não exista ao fazer upload', async () => {
    const uploadDir = path.resolve(process.cwd(), 'uploads');
    
    // 1. Garantir que a pasta NÃO existe antes do teste
    if (fs.existsSync(uploadDir)) {
      // Remover arquivos internos primeiro
      const files = fs.readdirSync(uploadDir);
      for (const file of files) {
        fs.unlinkSync(path.join(uploadDir, file));
      }
      fs.rmdirSync(uploadDir);
    }
    expect(fs.existsSync(uploadDir)).toBe(false);

    // 2. Tentar fazer upload
    const res = await request(app)
      .post(`/reimbursements/${reimbursementId}/attachments`)
      .set('Authorization', `Bearer ${colaboradorToken}`)
      .attach('files', testFilePath);

    expect(res.status).toBe(200);
    
    // 3. Verificar se a pasta foi criada
    expect(fs.existsSync(uploadDir)).toBe(true);

    // Limpeza final para não deixar lixo
    const attachment = await prisma.attachment.findFirst({ where: { requestId: reimbursementId } });
    if (attachment) {
      const physicalName = attachment.fileUrl.split('/uploads/').pop();
      if (physicalName) {
        const pPath = path.join(uploadDir, physicalName);
        if (fs.existsSync(pPath)) fs.unlinkSync(pPath);
      }
    }
  });
});

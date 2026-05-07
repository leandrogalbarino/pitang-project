import { prisma } from '../core/prismaClient';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

interface LoggedUser {
  id: string;
  role: string;
  [key: string]: any;
}

export class ReimbursementService {
  async create(data: any, loggedUser: LoggedUser) {
    if (loggedUser?.role !== 'COLABORADOR') {
      throw new Error('UNAUTHORIZED');
    }

    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, active: true },
    });

    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    // 2. Validar valor máximo da categoria
    if (data.amount > category.amountMax) {
      throw new Error('AMOUNT_EXCEEDS_CATEGORY_LIMIT');
    }

    const reimbursement = await prisma.reimbursementRequest.create({
      data: {
        description: data.description,
        amount: data.amount,
        expenseDate: dayjs.utc(data.expenseDate).startOf('day').toDate(),
        userId: loggedUser.id,
        categoryId: data.categoryId,
        status: 'RASCUNHO',
      },
    });

    await prisma.requestHistory.create({
      data: {
        requestId: reimbursement.id,
        userId: loggedUser.id,
        action: 'CREATED',
        observation: 'Solicitação criada pelo colaborador.',
      },
    });

    return reimbursement;
  }

  async update(id: string, data: any, loggedUser: LoggedUser) {
    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id },
    });

    if (loggedUser?.role !== 'COLABORADOR') {
      throw new Error('UNAUTHORIZED');
    }

    if (!reimbursement) {
      throw new Error('REIMBURSEMENT_NOT_FOUND');
    }

    if (reimbursement.userId !== loggedUser.id) {
      throw new Error('UNAUTHORIZED');
    }

    if (reimbursement.status !== 'RASCUNHO') {
      throw new Error('INVALID_STATUS_FOR_UPDATE');
    }

    const categoryIdToUse = data.categoryId || reimbursement.categoryId;
    const amountToValidate = data.amount || reimbursement.amount;

    const category = await prisma.category.findFirst({
      where: { id: categoryIdToUse, active: true },
    });

    if (!category) {
      throw new Error('CATEGORY_NOT_FOUND');
    }

    if (amountToValidate > category.amountMax) {
      throw new Error('AMOUNT_EXCEEDS_CATEGORY_LIMIT');
    }

    const updated = await prisma.reimbursementRequest.update({
      where: { id },
      data: {
        ...data,
        expenseDate: data.expenseDate
          ? dayjs.utc(data.expenseDate).startOf('day').toDate()
          : undefined,
      },
    });

    await prisma.requestHistory.create({
      data: {
        requestId: updated.id,
        userId: loggedUser.id,
        action: 'UPDATED',
        observation: 'Solicitação atualizada pelo colaborador.',
      },
    });

    return updated;
  }

  async submit(id: string, loggedUser: LoggedUser) {
    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id },
      include: {
        _count: {
          select: { attachments: true },
        },
      },
    });

    if (loggedUser?.role !== 'COLABORADOR') {
      throw new Error('UNAUTHORIZED');
    }

    if (!reimbursement) {
      throw new Error('REIMBURSEMENT_NOT_FOUND');
    }

    if (reimbursement.amount > 150 && reimbursement._count.attachments === 0) {
      throw new Error('AMOUNT_REQUIRED_FILES');
    }

    if (reimbursement.userId !== loggedUser.id) {
      throw new Error('UNAUTHORIZED');
    }

    if (reimbursement.status !== 'RASCUNHO') {
      throw new Error('INVALID_STATUS_FOR_UPDATE');
    }

    await prisma.reimbursementRequest.update({
      where: { id },
      data: { status: 'ENVIADO' },
    });

    await prisma.requestHistory.create({
      data: {
        requestId: id,
        userId: loggedUser.id,
        action: 'SUBMITTED',
        observation: 'Solicitação enviada para análise.',
      },
    });
  }
  async approve(id: string, loggedUser: LoggedUser) {
    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id },
    });
    if (loggedUser?.role !== 'GESTOR') {
      throw new Error('UNAUTHORIZED');
    }

    if (!reimbursement) {
      throw new Error('REIMBURSEMENT_NOT_FOUND');
    }

    if (reimbursement.status !== 'ENVIADO') {
      throw new Error('INVALID_STATUS_FOR_UPDATE');
    }

    await prisma.reimbursementRequest.update({
      where: { id },
      data: { status: 'APROVADO' },
    });
    await prisma.requestHistory.create({
      data: {
        requestId: id,
        userId: loggedUser.id,
        action: 'APPROVED',
        observation: 'Solicitação aprovada pelo gestor.',
      },
    });
  }

  async reject(id: string, validatedData: any, loggedUser: LoggedUser) {
    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id },
    });

    if (loggedUser?.role !== 'GESTOR') {
      throw new Error('UNAUTHORIZED');
    }

    if (!reimbursement) {
      throw new Error('REIMBURSEMENT_NOT_FOUND');
    }

    if (reimbursement.status !== 'ENVIADO') {
      throw new Error('INVALID_STATUS_FOR_UPDATE');
    }

    await prisma.reimbursementRequest.update({
      where: { id },
      data: {
        status: 'REJEITADO',
        rejectionDescription: validatedData.rejectionDescription,
      },
    });

    await prisma.requestHistory.create({
      data: {
        requestId: id,
        userId: loggedUser.id,
        action: 'REJECTED',
        observation: `Solicitação rejeitada. Justificativa: ${validatedData.rejectionDescription}`,
      },
    });
  }

  async pay(id: string, loggedUser: LoggedUser) {
    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id },
    });

    if (loggedUser?.role !== 'FINANCEIRO') {
      throw new Error('UNAUTHORIZED');
    }

    if (!reimbursement) {
      throw new Error('REIMBURSEMENT_NOT_FOUND');
    }

    if (reimbursement.status !== 'APROVADO') {
      throw new Error('INVALID_STATUS_FOR_UPDATE');
    }

    await prisma.reimbursementRequest.update({
      where: { id },
      data: {
        status: 'PAGO',
      },
    });

    await prisma.requestHistory.create({
      data: {
        requestId: id,
        userId: loggedUser.id,
        action: 'PAID',
        observation: 'Pagamento realizado pelo financeiro.',
      },
    });
  }
  async cancel(id: string, loggedUser: LoggedUser) {
    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id },
    });

    if (loggedUser?.role !== 'COLABORADOR') {
      throw new Error('UNAUTHORIZED');
    }

    if (!reimbursement) {
      throw new Error('REIMBURSEMENT_NOT_FOUND');
    }

    if (reimbursement.userId !== loggedUser.id) {
      throw new Error('UNAUTHORIZED');
    }

    if (reimbursement.status !== 'RASCUNHO') {
      throw new Error('INVALID_STATUS_FOR_UPDATE');
    }

    await prisma.reimbursementRequest.update({
      where: { id },
      data: { status: 'CANCELADO' },
    });

    await prisma.requestHistory.create({
      data: {
        requestId: id,
        userId: loggedUser.id,
        action: 'CANCELED',
        observation: 'Solicitação cancelada pelo colaborador.',
      },
    });
  }
}

export const reimbursementService = new ReimbursementService();

import type { Request, Response } from 'express';
import dayjs from 'dayjs';

import * as res from '../../utils/responseHttp';
import { prisma } from '../../core/prismaClient';
import {
  ReimbursementRequestSchema,
  ReimbursementUpdateSchema,
  RejectionSchema,
  uuidParam,
  PaginationSchema,
} from '../../schemas';
import { getPagination, formatPaginatedResponse } from '../../utils/pagination';
import { sendNotification } from '../../utils/notifications';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const createReimbursement = async (
  request: Request,
  response: Response,
) => {
  try {
    const validatedData = ReimbursementRequestSchema.safeParse(request.body);
    if (!validatedData.success) {
      return res.handleValidationError(response, validatedData.error);
    }

    const { categoryId, description, amount, expenseDate } = validatedData.data;

    // Verificar se a categoria existe e está ativa
    const category = await prisma.category.findFirst({
      where: { id: categoryId, active: true },
    });

    if (!category) {
      return res.notFound404(response, 'Categoria não encontrada.');
    }

    if (validatedData.data.amount > category.amountMax) {
      return res.clientFieldsError400(response, {
        amount: [
          `Valor máximo permitido na categoria ${category.name}: R$ ${category.amountMax}.00`,
        ],
      });
    }

    // Criar a solicitação utilizando dayjs para normalizar a data se necessário
    const reimbursement = await prisma.reimbursementRequest.create({
      data: {
        description,
        amount,
        expenseDate: dayjs.utc(expenseDate).startOf('day').toDate(),
        userId: request.user.id,
        categoryId,
        status: 'RASCUNHO',
      },
    });

    // Gerar histórico
    await prisma.requestHistory.create({
      data: {
        requestId: reimbursement.id,
        userId: request.user.id,
        action: 'CREATED',
        observation: 'Solicitação criada pelo colaborador.',
      },
    });

    sendNotification(
      'Nova Solicitação de Reembolso',
      `O colaborador ${request.user.name} criou uma nova solicitação de R$ ${amount.toFixed(2)}.`,
    );

    return res.successCreated(
      response,
      'Solicitação criada com sucesso.',
      reimbursement,
    );
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

export const updateReimbursement = async (
  request: Request,
  response: Response,
) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    const validatedData = ReimbursementUpdateSchema.safeParse(request.body);
    if (!validatedData.success) {
      return res.handleValidationError(response, validatedData.error);
    }

    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id: validatedId.data.id },
    });

    if (!reimbursement) {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    // Apenas o dono pode editar
    if (reimbursement.userId !== request.user.id) {
      return res.userUnauthorized403(response, 'Ação não permitida.');
    }

    // Apenas em RASCUNHO
    if (reimbursement.status !== 'RASCUNHO') {
      return res.clientError400(
        response,
        'Edição permitida apenas enquanto estão em Rascunho.',
      );
    }

    // Verificar se a categoria existe e está ativa
    if (validatedData.data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: validatedData.data.categoryId, active: true },
      });

      if (!category) {
        return res.notFound404(response, 'Categoria não encontrada.');
      }
    }

    const updateData = {
      ...validatedData.data,
      expenseDate: validatedData.data.expenseDate
        ? dayjs.utc(validatedData.data.expenseDate).startOf('day').toDate()
        : undefined,
    };

    const updatedReimbursement = await prisma.reimbursementRequest.update({
      where: { id: validatedId.data.id },
      data: updateData,
    });

    // Gerar histórico
    await prisma.requestHistory.create({
      data: {
        requestId: updatedReimbursement.id,
        userId: request.user.id,
        action: 'UPDATED',
        observation: 'Solicitação atualizada pelo colaborador.',
      },
    });

    sendNotification(
      'Solicitação Atualizada',
      `O colaborador ${request.user.name} atualizou os dados da solicitação #${updatedReimbursement.id.split('-')[0]}.`,
    );

    return res.successData(response, updatedReimbursement);
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Envia uma solicitação para análise.
 */
export const submitReimbursement = async (
  request: Request,
  response: Response,
) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id: validatedId.data.id },
      include: {
        _count: {
          select: { attachments: true },
        },
      },
    });

    if (!reimbursement) {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    if (reimbursement.amount > 150 && reimbursement._count.attachments === 0) {
      return res.clientError400(
        response,
        'É necessário anexar pelo menos um comprovante para enviar a solicitação.',
      );
    }

    if (reimbursement.userId !== request.user.id) {
      return res.userUnauthorized403(response, 'Ação não permitida.');
    }

    if (reimbursement.status !== 'RASCUNHO') {
      return res.clientError400(response, 'Transição inválida.');
    }

    await prisma.reimbursementRequest.update({
      where: { id: validatedId.data.id },
      data: { status: 'ENVIADO' },
    });

    // Gerar histórico
    await prisma.requestHistory.create({
      data: {
        requestId: validatedId.data.id,
        userId: request.user.id,
        action: 'SUBMITTED',
        observation: 'Solicitação enviada para análise.',
      },
    });

    sendNotification(
      'Solicitação Enviada para Análise',
      `Uma nova solicitação aguarda aprovação do gestor.`,
    );

    return res.successData(response, {
      message: 'Solicitação enviada para análise.',
    });
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Aprova uma solicitação (Apenas status ENVIADO e pelo GESTOR).
 */
export const approveReimbursement = async (
  request: Request,
  response: Response,
) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id: validatedId.data.id },
    });

    if (!reimbursement) {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    if (reimbursement.status !== 'ENVIADO') {
      return res.clientError400(
        response,
        'Apenas solicitações enviadas podem ser aprovadas.',
      );
    }

    await prisma.reimbursementRequest.update({
      where: { id: validatedId.data.id },
      data: { status: 'APROVADO' },
    });

    await prisma.requestHistory.create({
      data: {
        requestId: validatedId.data.id,
        userId: request.user.id,
        action: 'APPROVED',
        observation: 'Solicitação aprovada pelo gestor.',
      },
    });

    sendNotification(
      'Solicitação Aprovada',
      `A solicitação #${validatedId.data.id.split('-')[0]} foi aprovada pelo gestor.`,
    );

    return res.successData(response, { message: 'Solicitação aprovada.' });
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Rejeita uma solicitação (Apenas status ENVIADO e pelo GESTOR).
 */
export const rejectReimbursement = async (
  request: Request,
  response: Response,
) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    const validatedData = RejectionSchema.safeParse(request.body);
    if (!validatedData.success) {
      return res.handleValidationError(response, validatedData.error);
    }

    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id: validatedId.data.id },
    });

    if (!reimbursement) {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    if (reimbursement.status !== 'ENVIADO') {
      return res.clientError400(
        response,
        'Apenas solicitações enviadas podem ser rejeitadas.',
      );
    }

    await prisma.reimbursementRequest.update({
      where: { id: validatedId.data.id },
      data: {
        status: 'REJEITADO',
        rejectionDescription: validatedData.data.rejectionDescription,
      },
    });

    await prisma.requestHistory.create({
      data: {
        requestId: validatedId.data.id,
        userId: request.user.id,
        action: 'REJECTED',
        observation: `Solicitação rejeitada. Justificativa: ${validatedData.data.rejectionDescription}`,
      },
    });

    sendNotification(
      'Solicitação Rejeitada',
      `A solicitação #${validatedId.data.id.split('-')[0]} foi rejeitada pelo gestor.`,
    );

    return res.successData(response, { message: 'Solicitação rejeitada.' });
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Marca uma solicitação como paga (Apenas status APROVADO e pelo FINANCEIRO).
 */
export const payReimbursement = async (
  request: Request,
  response: Response,
) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id: validatedId.data.id },
    });

    if (!reimbursement) {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    if (reimbursement.status !== 'APROVADO') {
      return res.clientError400(
        response,
        'Apenas solicitações aprovadas podem ser pagas.',
      );
    }

    await prisma.reimbursementRequest.update({
      where: { id: validatedId.data.id },
      data: { status: 'PAGO' },
    });

    await prisma.requestHistory.create({
      data: {
        requestId: validatedId.data.id,
        userId: request.user.id,
        action: 'PAID',
        observation: 'Pagamento realizado pelo financeiro.',
      },
    });

    sendNotification(
      'Pagamento Realizado',
      `O financeiro realizou o pagamento da solicitação #${validatedId.data.id.split('-')[0]}.`,
    );

    return res.successData(response, { message: 'Pagamento realizado.' });
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Cancela uma solicitação (Apenas status RASCUNHO e pelo dono).
 */
export const cancelReimbursement = async (
  request: Request,
  response: Response,
) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id: validatedId.data.id },
    });

    if (!reimbursement) {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    if (reimbursement.userId !== request.user.id) {
      return res.userUnauthorized403(response, 'Ação não permitida.');
    }

    if (reimbursement.status !== 'RASCUNHO') {
      return res.clientError400(
        response,
        'Apenas solicitações em rascunho podem ser canceladas.',
      );
    }

    await prisma.reimbursementRequest.update({
      where: { id: validatedId.data.id },
      data: { status: 'CANCELADO' },
    });

    await prisma.requestHistory.create({
      data: {
        requestId: validatedId.data.id,
        userId: request.user.id,
        action: 'CANCELED',
        observation: 'Solicitação cancelada pelo colaborador.',
      },
    });

    sendNotification(
      'Solicitação Cancelada',
      `O colaborador ${request.user.name} cancelou a solicitação #${validatedId.data.id.split('-')[0]}.`,
    );

    return res.successData(response, { message: 'Solicitação cancelada.' });
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

const getReimbursementsClauses = (request: Request) => {
  const user = request.user;
  let whereClause: any = {};

  // Filtros de Perfil (Base)
  if (user.role === 'COLABORADOR') {
    whereClause.userId = user.id;
  } else if (user.role === 'GESTOR') {
    whereClause.status = 'ENVIADO';
  } else if (user.role === 'FINANCEIRO') {
    whereClause.status = 'APROVADO';
  }

  const { search, category, status } = request.query;

  if (status) {
    whereClause.status = status;
  }

  if (search) {
    whereClause.user = {
      name: { contains: String(search), mode: 'insensitive' },
    };
  }

  if (category) {
    whereClause.category = {
      name: { contains: String(category), mode: 'insensitive' },
    };
  }

  return whereClause;
};

const getReimbursementsOrder = (request: Request) => {
  const { order, orderDirection } = request.query;
  let orderBy: any = {};
  if (order === 'date') {
    orderBy = {
      expenseDate: orderDirection ? orderDirection : 'desc',
    };
  }
  if (order === 'amount') {
    orderBy = {
      amount: orderDirection ? orderDirection : 'desc',
    };
  }
  return orderBy;
};

export const getReimbursements = async (
  request: Request,
  response: Response,
) => {
  try {
    const whereClause = getReimbursementsClauses(request);
    const orderBy = getReimbursementsOrder(request);

    const validatedPagination = PaginationSchema.safeParse(request.query);
    const { page, limit } = validatedPagination.success
      ? validatedPagination.data
      : { page: 1, limit: 10 };

    const { skip, take } = getPagination(page, limit);

    const [total, result] = await Promise.all([
      prisma.reimbursementRequest.count({
        where: whereClause,
      }),
      prisma.reimbursementRequest.findMany({
        where: whereClause,
        include: {
          category: true,
          attachments: true,
          user: {
            select: { name: true, email: true },
          },
        },
        skip,
        take,
        orderBy:
          Object.keys(orderBy).length > 0 ? orderBy : { createdAt: 'desc' },
      }),
    ]);

    return res.successData(
      response,
      formatPaginatedResponse(result, total, page, limit),
    );
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Obtém os detalhes de uma solicitação específica.
 */
export const getSingleReimbursement = async (
  request: Request,
  response: Response,
) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id: validatedId.data.id },
      include: {
        category: true,
        user: {
          select: { name: true, email: true },
        },
        attachments: true,
        histories: {
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!reimbursement) {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    // Verificar permissão de visualização
    if (
      request.user.role === 'COLABORADOR' &&
      reimbursement.userId !== request.user.id
    ) {
      return res.userUnauthorized403(response, 'Ação não permitida.');
    }

    return res.successData(response, reimbursement);
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Adiciona anexos a uma solicitação (Apenas status RASCUNHO e pelo dono).
 */
export const addAttachments = async (request: Request, response: Response) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    const reimbursement = await prisma.reimbursementRequest.findUnique({
      where: { id: validatedId.data.id },
    });

    if (!reimbursement) {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    if (reimbursement.userId !== request.user.id) {
      return res.userUnauthorized403(response, 'Ação não permitida.');
    }

    if (reimbursement.status !== 'RASCUNHO') {
      return res.clientError400(
        response,
        'Anexos só podem ser adicionados em rascunhos.',
      );
    }

    const files = request.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.clientError400(response, 'Nenhum arquivo enviado.');
    }

    const attachments = await Promise.all(
      files.map((file) => {
        const fileUrl = `${request.protocol}://${request.get('host')}/uploads/${file.filename}`;

        return prisma.attachment.create({
          data: {
            requestId: validatedId.data.id,
            fileName: file.originalname,
            fileUrl: fileUrl,
            fileType: file.mimetype,
          },
        });
      }),
    );

    // Gerar histórico com os nomes dos arquivos
    const fileNames = files.map((f) => f.originalname).join(', ');
    await prisma.requestHistory.create({
      data: {
        requestId: validatedId.data.id,
        userId: request.user.id,
        action: 'UPDATED',
        observation: `Adicionado(s) ${files.length} anexo(s): ${fileNames}`,
      },
    });

    sendNotification(
      'Anexos Adicionados',
      `Foram adicionados ${files.length} novos anexos à solicitação #${validatedId.data.id.split('-')[0]}.`,
    );

    return res.successData(response, attachments);
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Obtém o histórico de uma solicitação.
 */
export const getRequestHistory = async (
  request: Request,
  response: Response,
) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    const history = await prisma.requestHistory.findMany({
      where: { requestId: validatedId.data.id },
      include: {
        user: {
          select: { name: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.successData(response, history);
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

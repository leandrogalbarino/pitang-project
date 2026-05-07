import type { Request, Response } from 'express';
import dayjs from 'dayjs';

import * as res from '../../utils/responseHttp';
import { prisma } from '../../core/prismaClient';
import { reimbursementService } from '../../services/reimbursements.service';
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

    const reimbursement = await reimbursementService.create(
      validatedData.data,
      request.user,
    );

    sendNotification(
      'Nova Solicitação de Reembolso',
      `O colaborador ${request.user.name} criou uma nova solicitação de R$ ${validatedData.data.amount.toFixed(2)}.`,
    );

    return res.successCreated(
      response,
      'Solicitação criada com sucesso.',
      reimbursement,
    );
  } catch (error: any) {
    if (error.message === 'CATEGORY_NOT_FOUND') {
      return res.notFound404(response, 'Categoria não encontrada.');
    }
    if (error.message === 'AMOUNT_EXCEEDS_CATEGORY_LIMIT') {
      return res.clientFieldsError400(response, {
        amount: ['Valor excede o limite permitido para esta categoria.'],
      });
    }
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

    const updated = await reimbursementService.update(
      validatedId.data.id,
      validatedData.data,
      request.user,
    );

    sendNotification(
      'Solicitação Atualizada',
      `O colaborador ${request.user.name} atualizou os dados da solicitação #${updated.id.split('-')[0]}.`,
    );

    return res.successData(response, updated);
  } catch (error: any) {
    if (error.message === 'REIMBURSEMENT_NOT_FOUND') {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.userUnauthorized403(response, 'Ação não permitida.');
    }
    if (error.message === 'INVALID_STATUS_FOR_UPDATE') {
      return res.clientError400(
        response,
        'Edição permitida apenas enquanto em rascunho.',
      );
    }
    if (error.message === 'CATEGORY_NOT_FOUND') {
      return res.notFound404(response, 'Categoria não encontrada ou inativa.');
    }
    if (error.message === 'AMOUNT_EXCEEDS_CATEGORY_LIMIT') {
      return res.clientFieldsError400(response, {
        amount: ['Valor excede o limite permitido para esta categoria.'],
      });
    }
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

    await reimbursementService.submit(validatedId.data.id, request.user);

    sendNotification(
      'Solicitação Enviada para Análise',
      `Uma nova solicitação aguarda aprovação do gestor.`,
    );

    return res.successData(response, {
      message: 'Solicitação enviada para análise.',
    });
  } catch (error: any) {
    if (error.message === 'REIMBURSEMENT_NOT_FOUND') {
      return res.notFound404(
        response,
        'Solicitação de reembolso não encontrada.',
      );
    }
    if (error.message === 'AMOUNT_REQUIRED_FILES') {
      return res.clientError400(
        response,
        'Solicitações de reembolso com valor superior a R$ 150,00 requerem arquivos anexados.',
      );
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.userUnauthorized403(
        response,
        'Você não tem permissão para realizar essa ação.',
      );
    }
    if (error.message === 'INVALID_STATUS_FOR_UPDATE') {
      return res.userUnauthorized403(
        response,
        'Apenas solicitações em Rascunho podem serem enviadas.',
      );
    }

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

    await reimbursementService.approve(validatedId.data.id, request.user);

    sendNotification(
      'Solicitação Aprovada',
      `A solicitação #${validatedId.data.id.split('-')[0]} foi aprovada pelo gestor.`,
    );

    return res.successData(response, { message: 'Solicitação aprovada.' });
  } catch (error: any) {
    if (error.message === 'REIMBURSEMENT_NOT_FOUND') {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    if (error.message === 'INVALID_STATUS_FOR_UPDATE') {
      return res.clientError400(
        response,
        'Apenas solicitações enviadas podem ser aprovadas.',
      );
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.userUnauthorized403(
        response,
        'Apenas gestores tem a permissão para realizar aprovações.',
      );
    }
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
    await reimbursementService.reject(
      validatedId.data.id,
      validatedData.data,
      request.user,
    );

    sendNotification(
      'Solicitação Rejeitada',
      `A solicitação #${validatedId.data.id.split('-')[0]} foi rejeitada pelo gestor.`,
    );

    return res.successData(response, { message: 'Solicitação rejeitada.' });
  } catch (error: any) {
    if (error.message === 'REIMBURSEMENT_NOT_FOUND') {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    if (error.message === 'INVALID_STATUS_FOR_UPDATE') {
      return res.clientError400(
        response,
        'Apenas solicitações enviadas podem ser rejeitadas.',
      );
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.userUnauthorized403(
        response,
        'Apenas gestores tem a permissão para realizar rejeições.',
      );
    }
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

    await reimbursementService.pay(validatedId.data.id, request.user);

    sendNotification(
      'Pagamento Realizado',
      `O financeiro realizou o pagamento da solicitação #${validatedId.data.id.split('-')[0]}.`,
    );

    return res.successData(response, { message: 'Pagamento realizado.' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return res.notFound404(
        response,
        'Apenas o Financeiro pode realizar pagamentos.',
      );
    }

    if (error.message === 'REIMBURSEMENT_NOT_FOUND') {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    if (error.message === 'INVALID_STATUS_FOR_UPDATE') {
      return res.clientError400(
        response,
        'Apenas solicitações aprovadas podem ser pagas.',
      );
    }

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

    await reimbursementService.cancel(validatedId.data.id, request.user);
    sendNotification(
      'Solicitação Cancelada',
      `O colaborador ${request.user.name} cancelou a solicitação #${validatedId.data.id.split('-')[0]}.`,
    );

    return res.successData(response, { message: 'Solicitação cancelada.' });
  } catch (error: any) {
    if (error.message === 'REIMBURSEMENT_NOT_FOUND') {
      return res.notFound404(response, 'Solicitação não encontrada.');
    }

    if (error.message === 'INVALID_STATUS_FOR_UPDATE') {
      return res.clientError400(
        response,
        'Apenas solicitações em rascunho podem ser canceladas.',
      );
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.userUnauthorized403(response, 'Ação não permitida.');
    }

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
    if (user.role === 'COLABORADOR') {
      whereClause.description = {
        contains: String(search),
        mode: 'insensitive',
      };
    } else {
      whereClause.user = {
        name: { contains: String(search), mode: 'insensitive' },
      };
    }
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

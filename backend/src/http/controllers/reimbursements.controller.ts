import type { Request, Response } from 'express';
import dayjs from 'dayjs';
import fs from 'fs';
import path from 'path';
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

    // Criar a solicitação utilizando dayjs para normalizar a data se necessário
    const reimbursement = await prisma.reimbursementRequest.create({
      data: {
        description,
        amount,
        expenseDate: dayjs(expenseDate).toDate(),
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

    const updateData = { ...validatedData.data };
    if (updateData.expenseDate) {
      updateData.expenseDate = dayjs(updateData.expenseDate).toDate();
    }

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
    });

    if (!reimbursement) {
      return res.notFound404(response, 'Solicitação não encontrada.');
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

    return res.successData(response, { message: 'Solicitação cancelada.' });
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Lista as solicitações de reembolso com base no perfil do usuário.
 */
export const getReimbursements = async (
  request: Request,
  response: Response,
) => {
  try {
    const user = request.user;
    let whereClause = {};

    // COLABORADOR vê apenas as suas
    if (user.role === 'COLABORADOR') {
      whereClause = { userId: user.id };
    }
    // GESTOR vê as enviadas
    else if (user.role === 'GESTOR') {
      whereClause = { status: { in: ['ENVIADO'] } };
    }
    // FINANCEIRO vê as aprovadas
    else if (user.role === 'FINANCEIRO') {
      whereClause = { status: { in: ['APROVADO'] } };
    }
    // ADMIN vê tudo

    const { search } = request.query;

    if (search) {
      whereClause = {
        AND: [
          whereClause,
          {
            OR: [
              {
                description: { contains: String(search), mode: 'insensitive' },
              },
              {
                category: {
                  name: { contains: String(search), mode: 'insensitive' },
                },
              },
              {
                user: {
                  name: { contains: String(search), mode: 'insensitive' },
                },
              },
            ],
          },
        ],
      };
    }

    const validatedPagination = PaginationSchema.safeParse(request.query);
    const { page, limit } = validatedPagination.success
      ? validatedPagination.data
      : { page: 1, limit: 10 };

    const { skip, take } = getPagination(page, limit);

    const [total, result] = await Promise.all([
      prisma.reimbursementRequest.count({
        where: { ...whereClause },
      }),
      prisma.reimbursementRequest.findMany({
        where: { ...whereClause },
        include: {
          category: true,
          attachments: true,
          user: {
            select: { name: true, email: true },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
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

/**
 * Lista os anexos de uma solicitação específica.
 */
export const getAttachments = async (request: Request, response: Response) => {
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

    // Colaborador só pode ver anexos das próprias solicitações
    if (
      request.user.role === 'COLABORADOR' &&
      reimbursement.userId !== request.user.id
    ) {
      return res.userUnauthorized403(response, 'Ação não permitida.');
    }

    const attachments = await prisma.attachment.findMany({
      where: { requestId: validatedId.data.id },
      orderBy: { createdAt: 'desc' },
    });

    return res.successData(response, attachments);
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};
/**
 * Deleta um anexo de uma solicitação (Apenas status RASCUNHO e pelo dono).
 */
export const deleteAttachment = async (
  request: Request,
  response: Response,
) => {
  try {
    const { idAttachement } = request.params;

    const validatedId = uuidParam.safeParse(request.params);
    const validatedAttachementId = uuidParam.safeParse({ id: idAttachement });

    if (!validatedId.success || !validatedAttachementId.success) {
      return res.clientError400(response, 'ID(s) inválido(s).');
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
        'Anexos só podem ser removidos em rascunhos.',
      );
    }

    const attachment = await prisma.attachment.findFirst({
      where: {
        id: validatedAttachementId.data.id,
        requestId: validatedId.data.id,
      },
    });

    if (!attachment) {
      return res.notFound404(response, 'Anexo não encontrado.');
    }

    const file = await prisma.attachment.delete({
      where: { id: validatedAttachementId.data.id },
    });

    // Gerar histórico com os nomes dos arquivos
    await prisma.requestHistory.create({
      data: {
        requestId: validatedId.data.id,
        userId: request.user.id,
        action: 'UPDATED',
        observation: `Removendo 1 anexo(s): ${file.fileName}`,
      },
    });

    // Remover arquivo físico do disco
    if (file.fileUrl.includes('/uploads/')) {
      const fileName = file.fileUrl.split('/uploads/').pop();
      if (fileName) {
        const filePath = path.join(process.cwd(), 'uploads', fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    return res.successDelete204(response);
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

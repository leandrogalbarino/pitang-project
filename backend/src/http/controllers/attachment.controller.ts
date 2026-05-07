import type { Request, Response } from 'express';
import { uuidParam } from '../../schemas';
import * as res from '../../utils/responseHttp';
import { prisma } from '../../core/prismaClient';
import { sendNotification } from '../../utils/notifications';
import fs from 'fs';
import path from 'path';

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

    sendNotification(
      'Anexo Removido',
      `O colaborador ${request.user.name} removeu um anexo da solicitação #${validatedId.data.id.split('-')[0]}.`,
    );

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

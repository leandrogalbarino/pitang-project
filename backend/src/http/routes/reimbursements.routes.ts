import express from 'express';
import { checkRole } from '../middlewares/role.middleware';
import { Role } from '../../../generated/prisma';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import {
  approveReimbursement,
  cancelReimbursement,
  createReimbursement,
  getReimbursements,
  getRequestHistory,
  getSingleReimbursement,
  payReimbursement,
  rejectReimbursement,
  submitReimbursement,
  updateReimbursement,
} from '../controllers/reimbursements.controller';
import { addAttachments, deleteAttachment, getAttachments } from '../controllers/attachment.controller';

const reimbursementsRoutes = express.Router();

// Listar solicitações (filtro por perfil no controller)
reimbursementsRoutes.get('/', getReimbursements);

// Criar nova solicitação
reimbursementsRoutes.post(
  '/',
  checkRole([Role.COLABORADOR]),
  createReimbursement,
);

// Detalhar solicitação específica
reimbursementsRoutes.get('/:id', getSingleReimbursement);

// Atualizar solicitação (Apenas em RASCUNHO pelo dono)
reimbursementsRoutes.put(
  '/:id',
  checkRole([Role.COLABORADOR]),
  updateReimbursement,
);

// Enviar para análise
reimbursementsRoutes.post(
  '/:id/submit',
  checkRole([Role.COLABORADOR]),
  submitReimbursement,
);

// Cancelar solicitação
reimbursementsRoutes.post(
  '/:id/cancel',
  checkRole([Role.COLABORADOR]),
  cancelReimbursement,
);

// Aprovar solicitação (Apenas GESTOR)
reimbursementsRoutes.post(
  '/:id/approve',
  checkRole([Role.GESTOR]),
  approveReimbursement,
);

// Rejeitar solicitação com justificativa (Apenas GESTOR)
reimbursementsRoutes.post(
  '/:id/reject',
  checkRole([Role.GESTOR]),
  rejectReimbursement,
);

// Pagar solicitação (Apenas FINANCEIRO)
reimbursementsRoutes.post(
  '/:id/pay',
  checkRole([Role.FINANCEIRO]),
  payReimbursement,
);

// Listar anexos da solicitação
reimbursementsRoutes.get('/:id/attachments', getAttachments);

// Adicionar anexos (Apenas em RASCUNHO pelo dono)
reimbursementsRoutes.post(
  '/:id/attachments',
  checkRole([Role.COLABORADOR]),
  uploadMiddleware,
  addAttachments,
);

reimbursementsRoutes.delete(
  '/:id/attachments/:idAttachement',
  checkRole([Role.COLABORADOR]),
  deleteAttachment,
);

// Obter histórico da solicitação
reimbursementsRoutes.get('/:id/history', getRequestHistory);

export default reimbursementsRoutes;

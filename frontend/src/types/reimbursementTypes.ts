import type { User } from './userTypes';
import type { Category } from './categoriesTypes';

export type ReimbursementStatus = 
  | 'RASCUNHO' 
  | 'ENVIADO' 
  | 'APROVADO' 
  | 'REJEITADO' 
  | 'PAGO' 
  | 'CANCELADO';

export type HistoryAction = 
  | 'CREATED'
  | 'UPDATED'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'CANCELED';

export interface Reimbursement {
  id: string;
  userId: string;
  categoryId: string;
  description: string;
  amount: number;
  expenseDate: string;
  status: ReimbursementStatus;
  rejectionDescription?: string;
  createdAt: string;
  updatedAt: string;
  
  user?: User;
  category?: Category;
  attachments?: Attachment[];
  histories?: RequestHistory[];
}

export interface Attachment {
  id: string;
  requestId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

export interface RequestHistory {
  id: string;
  requestId: string;
  userId: string;
  action: HistoryAction;
  observation?: string;
  createdAt: string;
  user?: User;
}

export interface ReimbursementListResponse {
  data: Reimbursement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

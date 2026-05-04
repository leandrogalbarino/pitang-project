import useSWR from 'swr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ReimbursementStatusBadge } from '@/components/dashboard/reimbursements/ReimbursementStatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Reimbursement } from '@/types/reimbursementTypes';
import { ReimbursementHistory } from './ReimbursementHistory';
import { 
  Calendar, 
  DollarSign, 
  Tag, 
  User, 
  FileText, 
  Paperclip,
  Loader2,
  ExternalLink,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ReimbursementDetailsProps {
  reimbursementId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReimbursementDetails({
  reimbursementId,
  open,
  onOpenChange,
}: ReimbursementDetailsProps) {
  const { data: reimbursement, isLoading } = useSWR<Reimbursement>(
    reimbursementId ? `/reimbursements/${reimbursementId}` : null
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl">
        <DialogHeader className="p-8 bg-slate-900 text-white">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl font-bold">Detalhes da Solicitação</DialogTitle>
            {reimbursement && <ReimbursementStatusBadge status={reimbursement.status} />}
          </div>
          <DialogDescription className="text-slate-400">
            ID: {reimbursementId}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-slate-500 font-medium">Carregando informações...</p>
            </div>
          ) : !reimbursement ? (
            <p className="text-center py-10 text-slate-500">Solicitação não encontrada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Coluna da Esquerda: Resumo e Dados */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Resumo da Despesa
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="border-none shadow-sm bg-white">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Categoria</p>
                          <p className="text-sm font-bold text-slate-900">{reimbursement.category?.name}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-none shadow-sm bg-white">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Valor Total</p>
                          <p className="text-sm font-bold text-slate-900">{formatCurrency(reimbursement.amount)}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-none shadow-sm bg-white">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Data da Despesa</p>
                          <p className="text-sm font-bold text-slate-900">{formatDate(reimbursement.expenseDate)}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">Solicitante</p>
                          <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{reimbursement.user?.name}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Descrição
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border-none shadow-sm text-slate-700 leading-relaxed">
                    {reimbursement.description}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    Anexos e Comprovantes
                  </h3>
                  <div className="grid gap-3">
                    {reimbursement.attachments && reimbursement.attachments.length > 0 ? (
                      reimbursement.attachments.map((file) => (
                        <a 
                          key={file.id} 
                          href={file.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-primary/10 group-hover:text-primary">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{file.fileName}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary" />
                        </a>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
                        <Paperclip className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500">Nenhum anexo disponível.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Coluna da Direita: Timeline */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Histórico
                </h3>
                <ReimbursementHistory history={reimbursement.histories || []} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

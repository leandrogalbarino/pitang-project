import useSWR from 'swr';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ReimbursementStatusBadge } from '@/components/ui/dashboard/reimbursements/ReimbursementStatusBadge';
import type { Reimbursement } from '@/types/reimbursementTypes';
import { ReimbursementHistory } from './ReimbursementHistory';
import { DetailsSummary } from '@/components/ui/dashboard/reimbursements/details/DetailsSummary';
import { DetailsAttachments } from '@/components/ui/dashboard/reimbursements/details/DetailsAttachments';
import { SectionTitle } from '@/components/ui/dashboard/SectionTitle';
import { LoadingState } from '@/components/ui/dashboard/LoadingState';
import { EmptyState } from '@/components/ui/dashboard/EmptyState';
import { FileText, Paperclip, Clock } from 'lucide-react';

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
    reimbursementId ? `/reimbursements/${reimbursementId}` : null,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl">
        <DialogHeader className="p-8 bg-slate-900 text-white">
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl font-bold">
              Detalhes da Solicitação
            </DialogTitle>
            {reimbursement && (
              <ReimbursementStatusBadge status={reimbursement.status} />
            )}
          </div>
          <DialogDescription className="text-slate-400">
            ID: {reimbursementId}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {isLoading ? (
            <LoadingState />
          ) : !reimbursement ? (
            <EmptyState message="Solicitação não encontrada." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Coluna Principal: Dados e Descrição */}
              <div className="md:col-span-2 space-y-8">
                <section>
                  <SectionTitle icon={FileText} title="Resumo da Despesa" />
                  <DetailsSummary reimbursement={reimbursement} />
                </section>

                <section>
                  <SectionTitle icon={FileText} title="Descrição" />
                  <div className="bg-white p-6 rounded-2xl border-none shadow-sm text-slate-700 leading-relaxed">
                    {reimbursement.description}
                  </div>
                </section>

                <section>
                  <SectionTitle
                    icon={Paperclip}
                    title="Anexos e Comprovantes"
                  />
                  <DetailsAttachments attachments={reimbursement.attachments} />
                </section>
              </div>

              {/* Coluna Lateral: Linha do Tempo */}
              <div className="space-y-6">
                <SectionTitle icon={Clock} title="Histórico" />
                <ReimbursementHistory history={reimbursement.histories || []} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

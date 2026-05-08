import { FileText, ExternalLink, Paperclip } from 'lucide-react';
import type { Reimbursement } from '@/types/reimbursementTypes';

interface DetailsAttachmentsProps {
  attachments?: Reimbursement['attachments'];
}

export function DetailsAttachments({ attachments }: DetailsAttachmentsProps) {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-slate-100/50 rounded-2xl border-2 border-dashed border-slate-200">
        <Paperclip className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm text-slate-500">Nenhum anexo disponível.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {attachments.map((file) => (
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
      ))}
    </div>
  );
}

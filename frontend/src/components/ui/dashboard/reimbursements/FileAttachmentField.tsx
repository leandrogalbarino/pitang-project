import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Paperclip, X, File as FileIcon, ExternalLink } from 'lucide-react';
import type { Attachment } from '@/types/reimbursementTypes';

interface FileAttachmentFieldProps {
  onFilesChange: (files: File[]) => void;
  selectedFiles: File[];
  existingAttachments?: Attachment[];
  onDeleteExisting?: (attachmentId: string) => void;
}

export function FileAttachmentField({ 
  onFilesChange, 
  selectedFiles,
  existingAttachments = [],
  onDeleteExisting
}: FileAttachmentFieldProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onFilesChange([...selectedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-3">
      <Label className="text-slate-700 font-semibold">Comprovantes (Anexos)</Label>
      
      <div className="flex flex-col gap-3">
        {/* Anexos já existentes no servidor */}
        {existingAttachments.length > 0 && (
          <div className="grid gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Anexos Salvos</p>
            {existingAttachments.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-2 bg-blue-50/50 border border-blue-100 rounded-lg text-sm group"
              >
                <div className="flex items-center gap-2 text-slate-600 truncate">
                  <FileIcon className="w-4 h-4 shrink-0 text-blue-500" />
                  <span className="truncate">{file.fileName}</span>
                  <a 
                    href={file.fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-1 hover:bg-blue-100 rounded text-blue-500"
                    title="Visualizar"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {onDeleteExisting && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-slate-400 hover:text-destructive"
                    onClick={() => onDeleteExisting(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Novos arquivos selecionados */}
        {selectedFiles.length > 0 && (
          <div className="grid gap-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Novos Arquivos</p>
            {selectedFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`} 
                className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm"
              >
                <div className="flex items-center gap-2 text-slate-600 truncate">
                  <FileIcon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{file.name}</span>
                  <span className="text-[10px] text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-slate-400 hover:text-destructive"
                  onClick={() => removeFile(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Botão de Upload */}
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <Label
            htmlFor="file-upload"
            className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all text-slate-500 hover:text-primary"
          >
            <Paperclip className="w-4 h-4" />
            <span className="text-sm font-medium">Adicionar mais arquivos</span>
          </Label>
        </div>
      </div>
    </div>
  );
}

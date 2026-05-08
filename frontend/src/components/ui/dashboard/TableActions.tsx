import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { TableCell } from '@/components/ui/table';

interface TableActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  deleteTitle?: string;
  editTitle?: string;
}

export function TableActions({
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  deleteTitle = 'Excluir',
  editTitle = 'Editar',
}: TableActionsProps) {
  return (
    <TableCell className="text-right">
      <div className="flex justify-end gap-2">
        {showEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-primary"
            onClick={onEdit}
            title={editTitle}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        )}
        {showDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-destructive"
            onClick={onDelete}
            title={deleteTitle}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </TableCell>
  );
}

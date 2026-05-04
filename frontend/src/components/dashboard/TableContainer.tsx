import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TableContainerProps {
  children: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
}

export function TableContainer({
  children,
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  showSearch = true,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}: TableContainerProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {showSearch && (
        <div className="p-4 border-b border-slate-50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              className="pl-10 bg-slate-50 border-none rounded-lg"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {(currentPage !== undefined && totalPages !== undefined) && (
        <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            {totalItems !== undefined && (
              <span>Total: {totalItems} {totalItems === 1 ? 'item' : 'itens'}</span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Página {currentPage} de {totalPages || 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-md"
                disabled={currentPage <= 1}
                onClick={() => onPageChange?.(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-md"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange?.(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import ListEmpty from '@/components/dashboard/ListEmpty';
import { TableActions } from '@/components/dashboard/TableActions';
import { TableContainer } from '@/components/dashboard/TableContainer';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { CategoryTableProps } from '@/types/categoriesTypes';

export function CategoryTable({
  categories,
  onEdit,
  onDelete,
  searchValue,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}: CategoryTableProps) {
  return (
    <TableContainer
      searchPlaceholder="Buscar categorias..."
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      totalItems={totalItems}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-slate-50">
            <TableHead className="w-[400px]">Nome</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id} className="border-slate-50">
              <TableCell className="font-medium text-slate-900">
                {category.name}
              </TableCell>
              <TableCell>
                <StatusBadge active={category.active} />
              </TableCell>
              <TableActions
                onEdit={() => onEdit(category)}
                onDelete={() => onDelete(category)}
                editTitle="Editar Categoria"
                deleteTitle="Desativar Categoria"
              />
            </TableRow>
          ))}
          {categories.length === 0 && (
            <ListEmpty message="Nenhuma categoria encontrada." />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

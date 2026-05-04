import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import type { UserTableProps } from '@/types/userTypes';
import { UserRoleBadge } from '../../../components/dashboard/users/UserTableComponents';
import ListEmpty from '@/components/dashboard/ListEmpty';
import { TableActions } from '@/components/dashboard/TableActions';
import { TableContainer } from '@/components/dashboard/TableContainer';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

export function UserTable({
  users,
  onEdit,
  onDelete,
  searchValue,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}: UserTableProps) {
  const { user: loggedInUser } = useAuth();
  return (
    <TableContainer
      searchPlaceholder="Buscar usuários..."
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
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => {
            const isSelf = user.id === loggedInUser?.id;

            return (
              <TableRow key={user.id} className="border-slate-50">
                <TableCell className="font-medium text-slate-900">
                  {user.name}
                </TableCell>
                <TableCell className="text-slate-500">{user.email}</TableCell>
                <TableCell>
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <StatusBadge active={!!user.active} />
                </TableCell>
                <TableActions
                  onEdit={() => onEdit(user)}
                  onDelete={() => onDelete(user)}
                  showEdit={!isSelf}
                  showDelete={!isSelf}
                  editTitle="Editar usuário"
                  deleteTitle="Desativar usuário"
                />
              </TableRow>
            );
          })}
          {users.length === 0 && (
            <ListEmpty message="Nenhum usuário encontrado." />
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

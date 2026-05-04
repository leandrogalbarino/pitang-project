import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api-client';
import { UserTable } from './components/UserTable';
import { ConfirmActionDialog } from '@/components/dashboard/ConfirmActionDialog';
import { toast } from 'sonner';
import type { User, UsersListResponse } from '@/types/userTypes';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { UserForm } from './components/UserForm';

export default function UsersList() {

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data: response, mutate } = useSWR<UsersListResponse>(`/users?page=${page}`);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    const allUsers = response?.data || [];
    if (!search) return allUsers;
    
    const searchLower = search.toLowerCase();
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(searchLower) || 
      user.email.toLowerCase().includes(searchLower)
    );
  }, [response?.data, search]);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedUser(null);
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    try {
      setIsDeleting(true);
      await api.delete(`/users/${selectedUser.id}`);
      
      mutate();
      setIsConfirmOpen(false);
      
      toast.success("Usuário desativado", {
        description: `O usuário "${selectedUser.name}" foi desativado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao deletar usuário', error);
      toast.error("Erro ao desativar", {
        description: "Não foi possível desativar o usuário. Tente novamente.",
      });
    } finally {
      setIsDeleting(false);
      setSelectedUser(null);
    }
  };

  const handleSuccess = () => {
    mutate();
    setIsFormOpen(false);
    toast.success(selectedUser ? "Usuário atualizado!" : "Novo usuário criado!", {
      description: selectedUser 
      ? "As alterações foram salvas com sucesso." 
      : "O usuário já pode acessar o sistema.",
    });
    setSelectedUser(null);
  };

  return (
    <div className="p-10">
      <PageHeader
        title="Usuários"
        description="Gerencie as contas de usuário e perfis de acesso do sistema."
        buttonLabel="Novo Usuário"
        isFormOpen={isFormOpen}
        onOpenChange={handleFormOpenChange}
        onAddNew={handleAddNew}
      >
        <UserForm 
          user={selectedUser}
          onSuccess={handleSuccess}
          onCancel={() => handleFormOpenChange(false)}
        />
      </PageHeader>

      <UserTable 
        users={filteredUsers}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        // Pagination Props
        currentPage={response?.pagination.page}
        totalPages={response?.pagination.totalPages}
        onPageChange={setPage}
        totalItems={response?.pagination.total}
        // Search Props
        searchValue={search}
        onSearchChange={setSearch}
      />

      <ConfirmActionDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
          if (!open) setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
        title="Você tem certeza?"
        confirmText="Sim, desativar"
        description={
          <>
            Esta ação irá desativar o usuário <strong>{selectedUser?.name}</strong>.
            Ele não poderá mais realizar login no sistema.
          </>
        }
      />
    </div>
  );
}

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api-client';
import { CategoryForm } from './components/CategoryForm';
import { CategoryTable } from './components/CategoryTable';
import { ConfirmActionDialog } from '@/components/ui/dashboard/ConfirmActionDialog';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/dashboard/PageHeader';
import type { Category } from '@/types/categoriesTypes';
import { useCategories } from '@/hooks/categories/useCategories';

export default function CategoriesList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';

  const { categories, pagination, mutate } = useCategories({ page, search });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const setPage = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newPage <= 1) {
      nextParams.delete('page');
    } else {
      nextParams.set('page', String(newPage));
    }
    setSearchParams(nextParams);
  };

  const setSearch = (newSearch: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newSearch) {
      nextParams.set('search', newSearch);
      nextParams.delete('page'); // Reset to first page on search
    } else {
      nextParams.delete('search');
      nextParams.delete('page');
    }
    setSearchParams(nextParams);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setIsFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setSelectedCategory(null);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    try {
      setIsDeleting(true);
      await api.delete(`/categories/${selectedCategory.id}`);

      mutate();
      setIsConfirmOpen(false);

      toast.success('Categoria desativada', {
        description: `A categoria "${selectedCategory.name}" foi desativada com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao deletar categoria', error);
      toast.error('Erro ao desativar', {
        description: 'Não foi possível desativar a categoria. Tente novamente.',
      });
    } finally {
      setIsDeleting(false);
      setSelectedCategory(null);
    }
  };

  const handleSuccess = () => {
    mutate();
    setIsFormOpen(false);
    setSelectedCategory(null);
    toast.success(
      selectedCategory ? 'Categoria atualizada!' : 'Nova categoria criada!',
      {
        description: selectedCategory
          ? 'As alterações foram salvas com sucesso.'
          : 'A categoria já está disponível para uso.',
      },
    );
  };

  return (
    <div className="p-10">
      <PageHeader
        title="Categorias"
        description="Gerencie as categorias de reembolso do sistema."
        buttonLabel="Nova Categoria"
        isFormOpen={isFormOpen}
        onOpenChange={handleFormOpenChange}
        onAddNew={handleAddNew}
      >
        <CategoryForm
          category={selectedCategory}
          onSuccess={handleSuccess}
          onCancel={() => handleFormOpenChange(false)}
        />
      </PageHeader>

      <CategoryTable
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        // Pagination Props
        currentPage={pagination?.page}
        totalPages={pagination?.totalPages}
        onPageChange={setPage}
        totalItems={pagination?.total}
        // Search Props
        searchValue={search}
        onSearchChange={setSearch}
      />

      <ConfirmActionDialog
        open={isConfirmOpen}
        onOpenChange={(open) => {
          setIsConfirmOpen(open);
          if (!open) setSelectedCategory(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
        title="Você tem certeza?"
        confirmText="Sim, desativar"
        description={
          <>
            Esta ação irá desativar a categoria{' '}
            <strong>{selectedCategory?.name}</strong>. Ela não poderá mais ser
            usada em novos reembolsos, mas os registros antigos serão mantidos.
          </>
        }
      />
    </div>
  );
}

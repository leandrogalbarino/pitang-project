import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api-client';
import { CategoryForm } from './components/CategoryForm';
import { CategoryTable } from './components/CategoryTable';
import { ConfirmActionDialog } from '@/components/dashboard/ConfirmActionDialog';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/PageHeader';
import type { CategoriesResponse, Category } from '@/types/categoriesTypes';


export default function CategoriesList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data: response, mutate } = useSWR<CategoriesResponse>(`/categories?page=${page}`);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const filteredCategories = useMemo(() => {
    const allCategories = response?.data || [];
    if (!search) return allCategories;
    
    const searchLower = search.toLowerCase();
    return allCategories.filter(cat => 
      cat.name.toLowerCase().includes(searchLower)
    );
  }, [response?.data, search]);

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
      
      toast.success("Categoria desativada", {
        description: `A categoria "${selectedCategory.name}" foi desativada com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao deletar categoria', error);
      toast.error("Erro ao desativar", {
        description: "Não foi possível desativar a categoria. Tente novamente.",
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
    toast.success(selectedCategory ? "Categoria atualizada!" : "Nova categoria criada!", {
      description: selectedCategory 
        ? "As alterações foram salvas com sucesso." 
        : "A categoria já está disponível para uso.",
    });
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
        categories={filteredCategories}
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
          if (!open) setSelectedCategory(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        variant="destructive"
        title="Você tem certeza?"
        confirmText="Sim, desativar"
        description={
          <>
            Esta ação irá desativar a categoria <strong>{selectedCategory?.name}</strong>.
            Ela não poderá mais ser usada em novos reembolsos, mas os registros antigos serão mantidos.
          </>
        }
      />
    </div>
  );
}

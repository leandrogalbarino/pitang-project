import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CategoryForm } from '@/pages/categories/components/CategoryForm';
import { api } from '@/lib/api-client';
import { SWRConfig } from 'swr';
import { Dialog } from '@/components/ui/dialog';

// Mocks
vi.mock('@/lib/api-client', () => ({
  api: {
    post: vi.fn(() => Promise.resolve()),
    put: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('@/components/ui/SelectGroup', () => ({
  SelectGroup: ({ label, name, control, children, placeholder }: any) => {
    const { Controller } = require('react-hook-form');
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <Controller
          name={name}
          control={control}
          render={({ field }: any) => (
            <select id={name} {...field}>
              <option value="">{placeholder}</option>
              {children}
            </select>
          )}
        />
      </div>
    );
  }
}));

vi.mock('@/components/ui/select', () => ({
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>
}));

describe('CategoryForm Component', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  const renderForm = (category = null) => {
    return render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <Dialog open={true}>
          <CategoryForm 
            category={category} 
            onSuccess={mockOnSuccess} 
            onCancel={mockOnCancel} 
          />
        </Dialog>
      </SWRConfig>
    );
  };

  it('Deve renderizar os campos corretamente para nova categoria', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: /Nova Categoria/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome da Categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valor Máximo/i)).toBeInTheDocument();
  });

  it('Deve preencher e enviar o formulário de nova categoria', async () => {
    renderForm();
    
    fireEvent.change(screen.getByLabelText(/Nome da Categoria/i), { target: { value: 'Viagens' } });
    fireEvent.change(screen.getByLabelText(/Valor Máximo/i), { target: { value: '500' } });
    
    const submitButton = screen.getByRole('button', { name: /Criar Categoria/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/categories', expect.objectContaining({
        name: 'Viagens',
        amountMax: 500
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('Deve preencher e enviar o formulário de edição de categoria', async () => {
    const existingCategory = { id: '123', name: 'Antiga', amountMax: 100, active: true };
    renderForm(existingCategory as any);
    
    expect(screen.getByText(/Editar Categoria/i)).toBeInTheDocument();
    
    fireEvent.change(screen.getByLabelText(/Nome da Categoria/i), { target: { value: 'Nova' } });
    
    const submitButton = screen.getByRole('button', { name: /Salvar Categoria/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/categories/123', expect.objectContaining({
        name: 'Nova'
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});

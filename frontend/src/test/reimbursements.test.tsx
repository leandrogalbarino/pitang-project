import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReimbursementForm } from '@/pages/reimbursements/components/ReimbursementForm';
import { SWRConfig } from 'swr';
import { Dialog } from '@/components/ui/dialog';
import { api } from '@/lib/api-client';
import { BrowserRouter } from 'react-router-dom';

// Mocks
vi.mock('@/lib/api-client', () => ({
  api: {
    post: vi.fn(() => Promise.resolve({ id: 'new-id' })),
    put: vi.fn(() => Promise.resolve()),
    delete: vi.fn(() => Promise.resolve()),
  },
}));

import { Controller } from 'react-hook-form';

vi.mock('@/components/dashboard/reimbursements/CategorySelectGroup', () => ({
  CategorySelectGroup: ({ control, categories, error }: any) => (
    <div>
      <label htmlFor="categoryId">Categoria</label>
      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <select 
            id="categoryId" 
            {...field}
          >
            <option value="">Selecione</option>
            {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      />
      {error && <span role="alert">{error.message}</span>}
    </div>
  )
}));

vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: { data: [{ id: 'cat1', name: 'Viagem' }] },
    isLoading: false,
  })),
  SWRConfig: ({ children }: any) => <div>{children}</div>,
}));

describe('ReimbursementForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  const renderForm = () => {
    return render(
      <BrowserRouter>
        <SWRConfig value={{ provider: () => new Map() }}>
          <Dialog open={true}>
            <ReimbursementForm 
              onSuccess={mockOnSuccess} 
              onCancel={mockOnCancel} 
            />
          </Dialog>
        </SWRConfig>
      </BrowserRouter>
    );
  };

  it('Deve renderizar os campos básicos do formulário', () => {
    renderForm();
    
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Data da Despesa/i)).toBeInTheDocument();
    expect(screen.getByText(/Comprovantes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salvar como Rascunho/i })).toBeInTheDocument();
  });

  it('Deve chamar onCancel ao clicar em cancelar', () => {
    renderForm();
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('Deve mostrar erro se o valor for menor ou igual a zero', async () => {
    renderForm();
    const amountInput = screen.getByLabelText(/Valor/i);
    const submitButton = screen.getByRole('button', { name: /Salvar como Rascunho/i });

    fireEvent.change(amountInput, { target: { value: '-10' } });
    fireEvent.click(submitButton);

    // O Zod deve disparar a validação
    await waitFor(() => {
        // Verifica se a validação impediu o envio (api.post não chamado)
        expect(api.post).not.toHaveBeenCalled();
    });
  });

  it('Deve chamar a API com sucesso ao preencher todos os campos corretamente', async () => {
    renderForm();
    
    // Seleciona a categoria
    fireEvent.change(screen.getByLabelText(/Categoria/i), { target: { value: 'cat1' } });
    // Preenche a descrição
    fireEvent.change(screen.getByLabelText(/Descrição/i), { target: { value: 'Viagem a trabalho' } });
    // Preenche o valor
    fireEvent.change(screen.getByLabelText(/Valor/i), { target: { value: '150' } });
    // Preenche a data
    fireEvent.change(screen.getByLabelText(/Data da Despesa/i), { target: { value: '2024-05-01' } });
    
    const submitButton = screen.getByRole('button', { name: /Salvar como Rascunho/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/reimbursements', expect.objectContaining({
            categoryId: 'cat1',
            description: 'Viagem a trabalho',
            amount: 150,
            expenseDate: '2024-05-01'
        }));
        expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});

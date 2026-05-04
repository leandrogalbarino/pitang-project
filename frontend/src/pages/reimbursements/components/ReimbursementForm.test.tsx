import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReimbursementForm } from './ReimbursementForm';
import { BrowserRouter } from 'react-router-dom';
import { Dialog } from '@/components/ui/dialog';

// Mocks necessários
vi.mock('swr', () => ({
  default: () => ({
    data: { data: [{ id: '1', name: 'Alimentação' }] },
    isLoading: false,
  }),
}));

vi.mock('@/lib/api-client', () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-1', name: 'Test User', role: 'COLABORADOR' },
  }),
}));

describe('ReimbursementForm', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  it('should render all form fields', () => {
    render(
      <BrowserRouter>
        <Dialog open={true}>
          <ReimbursementForm 
            onSuccess={mockOnSuccess} 
            onCancel={mockOnCancel} 
          />
        </Dialog>
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valor/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Data da Despesa/i)).toBeInTheDocument();
    expect(screen.getByText(/Comprovantes/i)).toBeInTheDocument();
  });
});

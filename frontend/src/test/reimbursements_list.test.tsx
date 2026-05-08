import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReimbursementsList from '@/pages/reimbursements/ReimbursementsList';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';
import * as AuthContext from '@/contexts/AuthContext';

// Mocks
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('swr', () => ({
  default: vi.fn((key) => {
    const defaultResponse = { mutate: vi.fn(), isLoading: false, error: null };

    if (typeof key === 'string' && key.includes('/categories')) {
      return {
        ...defaultResponse,
        data: { data: [{ id: 'c1', name: 'Transporte' }] },
      };
    }
    
    const mockReimbursement = { 
      id: '1', 
      description: 'Viagem SP', 
      amount: 500, 
      status: 'APROVADO', 
      expenseDate: new Date('2024-03-20T10:00:00Z'),
      createdAt: new Date('2024-03-20T10:00:00Z'),
      updatedAt: new Date('2024-03-20T10:00:00Z'),
      user: { name: 'João Silva', email: 'joao@test.com', role: 'COLABORADOR' },
      category: { id: 'c1', name: 'Transporte' },
      attachments: [],
      histories: [
        { 
          id: 'h1', 
          action: 'CREATED', 
          createdAt: new Date('2024-03-20T10:00:00Z'),
          user: { name: 'João Silva', role: 'COLABORADOR' }
        }
      ]
    };

    if (typeof key === 'string' && (key.includes('/reimbursements/') && key.split('/').length > 2)) {
      return {
        ...defaultResponse,
        data: mockReimbursement,
      };
    }

    return {
      ...defaultResponse,
      data: {
        data: [mockReimbursement],
        pagination: { page: 1, totalPages: 1, total: 1 },
      },
    };
  }),
  SWRConfig: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ReimbursementsList Page', () => {
  const renderList = () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'ADMIN' },
    } as any);

    return render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter>
          <ReimbursementsList />
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it('Deve permitir digitar no campo de pesquisa', async () => {
    renderList();
    const searchInput = screen.getByPlaceholderText(/Buscar por colaborador/i);
    
    fireEvent.change(searchInput, { target: { value: 'João' } });
    
    expect(searchInput).toHaveValue('João');
  });

  it('Deve abrir o modal de detalhes ao clicar no ícone de visualizar', async () => {
    renderList();
    
    const viewButton = screen.getByTitle(/Visualizar detalhes/i);
    fireEvent.click(viewButton);

    // O modal de detalhes tem o título "Resumo da Despesa"
    await waitFor(() => {
      expect(screen.getByText(/Resumo da Despesa/i)).toBeInTheDocument();
    });
  });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UsersList from '@/pages/users/UsersList';
import { BrowserRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';

// Mock do hook useSWR
vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    default: vi.fn(() => ({
      data: {
        data: [
          { id: '1', name: 'Leandro Admin', email: 'admin@pitang.com', role: 'ADMIN', active: true },
          { id: '2', name: 'Joao Colab', email: 'colab@pitang.com', role: 'COLABORADOR', active: true },
        ],
        pagination: { page: 1, totalPages: 1, total: 2 },
      },
      mutate: vi.fn(),
    })),
  };
});

describe('UsersList Page', () => {
  const renderUsers = () => {
    return render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <BrowserRouter>
          <UsersList />
        </BrowserRouter>
      </SWRConfig>
    );
  };

  it('Deve renderizar o título e os usuários na tabela', () => {
    renderUsers();
    
    expect(screen.getByText('Usuários')).toBeInTheDocument();
    expect(screen.getByText('Leandro Admin')).toBeInTheDocument();
    expect(screen.getByText('Joao Colab')).toBeInTheDocument();
  });

  it('Deve mostrar o botão de Novo Usuário', () => {
    renderUsers();
    expect(screen.getByText(/Novo Usuário/i)).toBeInTheDocument();
  });
});

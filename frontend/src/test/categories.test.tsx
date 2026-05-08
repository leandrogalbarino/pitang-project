import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoriesList from '@/pages/categories/CategoriesList';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';

// Mock do hook useSWR
vi.mock('swr', () => ({
  default: vi.fn(() => ({
    data: {
      data: [
        { id: '1', name: 'Alimentação', active: true },
        { id: '2', name: 'Transporte', active: true },
      ],
      pagination: { page: 1, totalPages: 1, total: 2 },
    },
    mutate: vi.fn(),
  })),
  SWRConfig: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock do react-router-dom
vi.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  Navigate: vi.fn(),
}));

describe('CategoriesList Page', () => {
  const renderCategories = () => {
    return render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter>
          <CategoriesList />
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it('Deve renderizar o título e os dados da tabela', () => {
    renderCategories();
    
    expect(screen.getByText('Categorias')).toBeInTheDocument();
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();
  });

  it('Deve mostrar o botão de Nova Categoria', () => {
    renderCategories();
    expect(screen.getByText(/Nova Categoria/i)).toBeInTheDocument();
  });

  it('Deve abrir o formulário ao clicar em Nova Categoria', () => {
    renderCategories();
    const addButton = screen.getByText(/Nova Categoria/i);
    
    fireEvent.click(addButton);
    
    expect(screen.getByText(/Adicione uma nova categoria para classificar os reembolsos/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome da Categoria/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Valor Máximo/i)).toBeInTheDocument();
  });
});

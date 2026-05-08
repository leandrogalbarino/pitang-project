import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '@/pages/Dashboard';
import { MemoryRouter } from 'react-router-dom';
import * as AuthContext from '@/contexts/AuthContext';

// Mock do react-router-dom
vi.mock('react-router-dom', () => ({
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
  Navigate: vi.fn(),
}));

// Mock do AuthContext de forma robusta
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Dashboard RBAC (Role Based Access Control)', () => {
  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );
  };

  it('Deve mostrar botão "Nova Solicitação" apenas para COLABORADOR', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'COLABORADOR' },
      signed: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
      loading: false,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    renderDashboard();
    expect(screen.getByText(/Nova Solicitação/i)).toBeInTheDocument();
    expect(screen.queryByText(/Gerenciar Usuários/i)).not.toBeInTheDocument();
  });

  it('Deve mostrar botões de gestão apenas para ADMIN', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'ADMIN' },
      signed: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
      loading: false,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    renderDashboard();
    expect(screen.getByText(/Gerenciar Usuários/i)).toBeInTheDocument();
    expect(screen.getByText(/Gerenciar Categorias/i)).toBeInTheDocument();
    expect(screen.queryByText(/Nova Solicitação/i)).not.toBeInTheDocument();
  });

  it('Deve mostrar "Pendências de Aprovação" apenas para GESTOR', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'GESTOR' },
      signed: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
      loading: false,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    renderDashboard();
    expect(screen.getByText(/Analisar Pendências/i)).toBeInTheDocument();
    expect(screen.queryByText(/Gerenciar Usuários/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nova Solicitação/i)).not.toBeInTheDocument();
  });

  it('Deve mostrar "Pendências de Pagamento" apenas para FINANCEIRO', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'FINANCEIRO' },
      signed: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
      loading: false,
    } as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    renderDashboard();
    expect(screen.getByText(/Realizar Pagamentos/i)).toBeInTheDocument();
    expect(screen.queryByText(/Nova Solicitação/i)).not.toBeInTheDocument();
  });
});

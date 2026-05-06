import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from '@/pages/Dashboard';
import { BrowserRouter } from 'react-router-dom';
import * as AuthContext from '@/contexts/AuthContext';

// Mock do hook useAuth que está no AuthContext
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...(actual as any), // eslint-disable-line @typescript-eslint/no-explicit-any
    useAuth: vi.fn(),
  };
});

describe('Dashboard RBAC (Role Based Access Control)', () => {
  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
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

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReimbursementTableActions } from '@/pages/reimbursements/components/ReimbursementTableActions';
import * as AuthContext from '@/contexts/AuthContext';

// Mock do hook useAuth
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual as any,
    useAuth: vi.fn(),
  };
});

describe('ReimbursementTableActions RBAC', () => {
  const mockItem = {
    id: '1',
    description: 'Teste',
    status: 'RASCUNHO',
    amount: 100,
    user: { name: 'User' },
  };

  const mockProps = {
    item: mockItem as any,
    onEdit: vi.fn(),
    onCancel: vi.fn(),
    onSubmit: vi.fn(),
    onApprove: vi.fn(),
    onReject: vi.fn(),
    onPay: vi.fn(),
    onView: vi.fn(),
  };

  it('Deve mostrar ações de edição apenas para COLABORADOR em RASCUNHO', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'COLABORADOR' },
    } as any);

    render(<ReimbursementTableActions {...mockProps} />);
    
    expect(screen.getByTitle(/Editar rascunho/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Enviar para análise/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Cancelar solicitação/i)).toBeInTheDocument();
  });

  it('Deve mostrar ações de aprovação apenas para GESTOR em ENVIADO', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'GESTOR' },
    } as any);

    const itemEnviado = { ...mockItem, status: 'ENVIADO' };

    render(<ReimbursementTableActions {...mockProps} item={itemEnviado as any} />);
    
    expect(screen.getByTitle(/Aprovar solicitação/i)).toBeInTheDocument();
    expect(screen.getByTitle(/Rejeitar solicitação/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/Editar rascunho/i)).not.toBeInTheDocument();
  });

  it('Deve mostrar ação de pagamento apenas para FINANCEIRO em APROVADO', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'FINANCEIRO' },
    } as any);

    const itemAprovado = { ...mockItem, status: 'APROVADO' };

    render(<ReimbursementTableActions {...mockProps} item={itemAprovado as any} />);
    
    expect(screen.getByTitle(/Marcar como pago/i)).toBeInTheDocument();
    expect(screen.queryByTitle(/Aprovar solicitação/i)).not.toBeInTheDocument();
  });

  it('Deve mostrar Visualizar para todos os perfis', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: { role: 'ADMIN' },
    } as any);

    render(<ReimbursementTableActions {...mockProps} />);
    
    expect(screen.getByTitle(/Visualizar detalhes/i)).toBeInTheDocument();
  });
});

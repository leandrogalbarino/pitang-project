import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UserForm } from '@/pages/users/components/UserForm';
import { api } from '@/lib/api-client';
import { AuthProvider } from '@/contexts/AuthContext';
import { Dialog } from '@/components/ui/dialog';

// Mocks
vi.mock('@/lib/api-client', () => ({
  api: {
    post: vi.fn(() => Promise.resolve()),
    patch: vi.fn(() => Promise.resolve()),
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

// Mock do hook useAuth para simular um admin logado
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'admin-id', role: 'ADMIN', name: 'Admin User' }
  }),
  AuthProvider: ({ children }: any) => <div>{children}</div>
}));

describe('UserForm Component', () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  const renderForm = (user = null) => {
    return render(
      <AuthProvider>
        <Dialog open={true}>
          <UserForm 
            user={user} 
            onSuccess={mockOnSuccess} 
            onCancel={mockOnCancel} 
          />
        </Dialog>
      </AuthProvider>
    );
  };

  it('Deve renderizar os campos básicos para novo usuário', () => {
    renderForm();
    expect(screen.getByRole('heading', { name: /Novo Usuário/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Senha$/i)).toBeInTheDocument();
  });

  it('Deve validar senhas diferentes', async () => {
    renderForm();
    
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Teste' } });
    fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'teste@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Senha$/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: '654321' } });
    
    const submitButton = screen.getByRole('button', { name: /Salvar Usuário/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/As senhas não coincidem/i)).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  it('Deve enviar o formulário de novo usuário com sucesso', async () => {
    renderForm();
    
    fireEvent.change(screen.getByLabelText(/Nome Completo/i), { target: { value: 'Novo Usuario' } });
    fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'novo@test.com' } });
    fireEvent.change(screen.getByLabelText(/^Senha$/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/Confirmar Senha/i), { target: { value: '123456' } });
    
    const submitButton = screen.getByRole('button', { name: /Salvar Usuário/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/users', expect.objectContaining({
        name: 'Novo Usuario',
        email: 'novo@test.com',
        role: 'COLABORADOR'
      }));
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
});

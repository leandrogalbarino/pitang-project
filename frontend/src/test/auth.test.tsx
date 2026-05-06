import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Login from '@/pages/Login';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock do useNavigate
const mockedUsedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockedUsedNavigate,
  };
});

describe('Login Page', () => {
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('Deve renderizar os campos do formulário corretamente', () => {
    renderLogin();
    expect(screen.getByText(/Acessar Conta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
  });

  it('Deve mostrar mensagens de erro para campos inválidos', async () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /Entrar/i });
    
    // Clica sem preencher nada
    fireEvent.click(submitButton);

    // Espera as mensagens do Zod aparecerem na tela
    await waitFor(() => {
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/Senha é obrigatória/i)).toBeInTheDocument();
    });

    expect(mockedUsedNavigate).not.toHaveBeenCalled();
  });

  it('Deve mostrar erro de email inválido ao digitar formato incorreto', async () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/E-mail/i);
    const submitButton = screen.getByRole('button', { name: /Entrar/i });

    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
    });
  });
});

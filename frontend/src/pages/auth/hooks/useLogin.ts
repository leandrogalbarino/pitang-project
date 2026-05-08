import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { api, type ApiError } from '@/lib/api-client';
import { useAuth, type UserPayload } from '@/contexts/AuthContext';
import { PATH_ROUTES } from '@/constants/routesConstants';
import type { LoginForm } from '@/schemas/usersSchema';

export function useLogin() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);

      const responseData = await api.post<{ token: string }>(
        '/auth/login',
        data,
      );
      const { token } = responseData;

      const decoded: UserPayload = jwtDecode(token);

      if (!decoded) {
        setError('Erro durante a autenticação');
        return;
      }

      signIn(token, decoded);
      navigate(PATH_ROUTES.DASHBOARD);
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Login error:', apiError);
      setError(apiError.message || 'Não foi possível realizar o login.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleLogin,
    isLoading,
    error,
    setError
  };
}

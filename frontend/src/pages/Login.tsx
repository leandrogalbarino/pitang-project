import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { PATH_ROUTES } from '@/constants/routesConstants';
import { useLogin } from './auth/hooks/useLogin';
import { LoginForm } from './auth/components/LoginForm';

export default function Login() {
  const navigate = useNavigate();
  const { signed } = useAuth();
  const { handleLogin, isLoading, error } = useLogin();

  useEffect(() => {
    if (signed) {
      navigate(PATH_ROUTES.DASHBOARD);
    }
  }, [signed, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Acessar Conta</CardTitle>
          <CardDescription>
            Entre com suas credenciais para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm 
            onSubmit={handleLogin} 
            isLoading={isLoading} 
            error={error} 
          />
        </CardContent>
      </Card>
    </div>
  );
}

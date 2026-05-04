import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { api, type ApiError } from '@/lib/api-client';
import { useAuth, type UserPayload } from '@/contexts/AuthContext';
import { jwtDecode } from 'jwt-decode';
import { loginSchema, type LoginForm } from '@/schemas/usersSchema';
import { PATH_ROUTES } from '@/constants/routesConstants';

const initialLoginValues: LoginForm = {
  email: '',
  password: '',
};

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signed } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (signed) {
      navigate(PATH_ROUTES.DASHBOARD);
    }
  }, [signed, navigate]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: initialLoginValues,
  });

  const onSubmit = async (data: LoginForm) => {
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        {...field}
                        className="rounded-lg h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="rounded-lg h-11"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg text-center animate-shake">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-lg text-base font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

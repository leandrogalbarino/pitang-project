import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { PATH_ROUTES } from '@/constants/routesConstants';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-10">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">
          Bem-vindo de volta! Aqui está o resumo do sistema.
        </p>
      </header>

      <section className="mt-10">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Ações Recomendadas</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.role === 'COLABORADOR' && (
              <Button 
                className="rounded-full"
                onClick={() => navigate(PATH_ROUTES.REIMBURSEMENTS + '?new=true')}
              >
                Nova Solicitação
              </Button>
            )}
            {user?.role === 'GESTOR' && (
              <Button 
                className="rounded-full"
                onClick={() => navigate(PATH_ROUTES.REIMBURSEMENTS)}
              >
                Ver Pendências de Aprovação
              </Button>
            )}
            {user?.role === 'FINANCEIRO' && (
              <Button 
                className="rounded-full"
                onClick={() => navigate(PATH_ROUTES.REIMBURSEMENTS)}
              >
                Ver Pendências de Pagamento
              </Button>
            )}

            {user?.role === 'ADMIN' && (
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={() => navigate(PATH_ROUTES.USERS)}
                >
                  Gerenciar Usuários
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full"
                  onClick={() => navigate(PATH_ROUTES.CATEGORIES)}
                >
                  Gerenciar Categorias
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

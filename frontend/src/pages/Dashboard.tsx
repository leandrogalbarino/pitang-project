import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { PATH_ROUTES } from '@/constants/routesConstants';

function DashboardButton({
  onClick,
  buttonText,
}: {
  onClick: () => void;
  buttonText: string;
}) {
  return (
    <Button className="rounded-full" onClick={onClick}>
      {buttonText}
    </Button>
  );
}

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
            <div className="flex flex-wrap gap-4">
              {user?.role === 'COLABORADOR' && (
                <DashboardButton
                  onClick={() => navigate(PATH_ROUTES.REIMBURSEMENTS)}
                  buttonText="Nova Solicitação"
                />
              )}
              {user?.role === 'GESTOR' && (
                <DashboardButton
                  onClick={() => navigate(PATH_ROUTES.REIMBURSEMENTS)}
                  buttonText="Ver Pendências de Aprovação"
                />
              )}
              {user?.role === 'FINANCEIRO' && (
                <DashboardButton
                  onClick={() => navigate(PATH_ROUTES.REIMBURSEMENTS)}
                  buttonText="Ver Pendências de Pagamento"
                />
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <DashboardButton
                    onClick={() => navigate(PATH_ROUTES.REIMBURSEMENTS)}
                    buttonText="Visualizar Solicitações de Reembolso"
                  />
                  <DashboardButton
                    onClick={() => navigate(PATH_ROUTES.USERS)}
                    buttonText="Gerenciar Usuários"
                  />
                  <DashboardButton
                    onClick={() => navigate(PATH_ROUTES.CATEGORIES)}
                    buttonText="Gerenciar Categorias"
                  />
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

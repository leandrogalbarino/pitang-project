import { CheckCircle2, Clock, ClipboardList, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { PATH_ROUTES } from '@/constants/routesConstants';
import { StatsCard } from '@/components/ui/dashboard/StatsCard';
import { QuickActionButton } from '@/components/ui/dashboard/QuickActionButton';
import { CategoryExpensesChart } from '@/components/ui/dashboard/CategoryExpensesChart';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';

const labelByRole: any = {
  ADMIN: 'Visualizar solicitações',
  GESTOR: 'Analisar Pendências',
  FINANCEIRO: 'Realizar Pagamentos',
  COLABORADOR: 'Nova Solicitação',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, isLoading, error } = useDashboardStats();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
        <p>Erro ao carregar estatísticas do dashboard.</p>
      </div>
    );
  }

  return (
    <div className="p-10 bg-slate-50/50 min-h-screen animate-in fade-in duration-500">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Bem-vindo de volta, <span className="font-semibold text-red-500">{user?.name}</span>.
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">Status do Sistema</p>
          <div className="flex items-center gap-2 text-emerald-500 justify-end">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold">Operacional</span>
          </div>
        </div>
      </header>

      {/* 
          SEÇÃO DE STATS: 
          Exibe os indicadores principais (KPIs) de acordo com o perfil do usuário logado.
      */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title={user?.role === 'FINANCEIRO' ? 'Pendentes de Pagamento' : 'Total Pago'}
          value={user?.role === 'FINANCEIRO' ? stats?.pendingPayment || 0 : formatCurrency(stats?.totalAmountPaid || 0)}
          icon={user?.role === 'FINANCEIRO' ? ClipboardList : CheckCircle2}
          color={user?.role === 'FINANCEIRO' ? 'blue' : 'emerald'}
          loading={isLoading}
        />
        <StatsCard
          title={user?.role === 'FINANCEIRO' ? 'Total Pago' : 'Pendentes de Aprovação'}
          value={
            user?.role === 'FINANCEIRO' ? formatCurrency(stats?.totalAmountPaid || 0) : stats?.pendingApproval || 0
          }
          icon={user?.role === 'FINANCEIRO' ? CheckCircle2 : Clock}
          color={user?.role === 'FINANCEIRO' ? 'emerald' : 'amber'}
          loading={isLoading}
        />
        <StatsCard
          title={user?.role === 'FINANCEIRO' ? 'Pendentes de Aprovação' : 'Aguardando Pagamento'}
          value={user?.role === 'FINANCEIRO' ? stats?.pendingApproval || 0 : stats?.pendingPayment || 0}
          icon={user?.role === 'FINANCEIRO' ? Clock : ClipboardList}
          color={user?.role === 'FINANCEIRO' ? 'amber' : 'blue'}
          loading={isLoading}
        />
        <StatsCard
          title="Total de Pedidos"
          value={stats?.totalRequests || 0}
          icon={TrendingUp}
          color="red"
          loading={isLoading}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Gráfico de Gastos por Categoria */}
        <CategoryExpensesChart data={stats?.byCategory} isLoading={isLoading} />

        {/* Card de Ações Rápidas */}
        <div className="space-y-6">
          <div className=" bg-red-500 rounded-2xl p-8 text-white shadow-lg shadow-red-200">
            <h3 className="text-xl font-bold mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <QuickActionButton
                onClick={() => navigate(PATH_ROUTES.REIMBURSEMENTS)}
                label={labelByRole[user?.role || '']}
              />

              {user?.role === 'ADMIN' && (
                <>
                  <QuickActionButton onClick={() => navigate(PATH_ROUTES.USERS)} label="Gerenciar Usuários" />
                  <QuickActionButton onClick={() => navigate(PATH_ROUTES.CATEGORIES)} label="Gerenciar Categorias" />
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Resumo Geral</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Solicitado</span>
                <span className="font-bold text-slate-800">{formatCurrency(stats?.totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Processos Pagos</span>
                <span className="font-bold text-emerald-600">{stats?.paid || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

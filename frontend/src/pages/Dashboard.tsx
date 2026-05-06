import { CheckCircle2, Clock, ClipboardList, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';
import useSWR from 'swr';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { PATH_ROUTES } from '@/constants/routesConstants';
import { Button } from '@/components/ui/button';

interface CategoryStat {
  name: string;
  total: number;
}

interface DashboardStats {
  totalRequests: number;
  totalAmount: number;
  totalAmountPaid: number;
  pendingApproval: number;
  pendingPayment: number;
  paid: number;
  byCategory: CategoryStat[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, error, isLoading } = useSWR<DashboardStats>('/dashboard/stats');

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
        <p>Erro ao carregar estatísticas do dashboard.</p>
      </div>
    );
  }

  const maxCategoryTotal = stats?.byCategory?.length 
    ? Math.max(...stats.byCategory.map(c => c.total)) 
    : 0;

  return (
    <div className="p-10 bg-slate-50/50 min-h-screen animate-in fade-in duration-500">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">
            Bem-vindo de volta, <span className="font-semibold text-indigo-600">{user?.name}</span>.
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

      {/* Grid de Estatísticas Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {(user?.role === 'ADMIN' || user?.role === 'COLABORADOR') && (
          <>
            <StatsCard title="Total Pago" value={formatCurrency(stats?.totalAmountPaid || 0)} icon={CheckCircle2} color="emerald" loading={isLoading} />
            <StatsCard title="Aguardando Aprovação" value={stats?.pendingApproval || 0} icon={Clock} color="amber" loading={isLoading} />
            <StatsCard title="Aguardando Pagamento" value={stats?.pendingPayment || 0} icon={ClipboardList} color="blue" loading={isLoading} />
            <StatsCard title="Total de Pedidos" value={stats?.totalRequests || 0} icon={TrendingUp} color="indigo" loading={isLoading} />
          </>
        )}

        {user?.role === 'GESTOR' && (
          <>
            <StatsCard title="Pendentes de Aprovação" value={stats?.pendingApproval || 0} icon={Clock} color="amber" loading={isLoading} />
            <StatsCard title="Aguardando Pagamento" value={stats?.pendingPayment || 0} icon={ClipboardList} color="blue" loading={isLoading} />
            <StatsCard title="Total de Pedidos" value={stats?.totalRequests || 0} icon={TrendingUp} color="indigo" loading={isLoading} />
            <StatsCard title="Total Pago" value={formatCurrency(stats?.totalAmountPaid || 0)} icon={CheckCircle2} color="emerald" loading={isLoading} />
          </>
        )}

        {user?.role === 'FINANCEIRO' && (
          <>
            <StatsCard title="Pendentes de Pagamento" value={stats?.pendingPayment || 0} icon={ClipboardList} color="blue" loading={isLoading} />
            <StatsCard title="Total Pago" value={formatCurrency(stats?.totalAmountPaid || 0)} icon={CheckCircle2} color="emerald" loading={isLoading} />
            <StatsCard title="Pendentes de Aprovação" value={stats?.pendingApproval || 0} icon={Clock} color="amber" loading={isLoading} />
            <StatsCard title="Total de Pedidos" value={stats?.totalRequests || 0} icon={TrendingUp} color="indigo" loading={isLoading} />
          </>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Gráfico de Gastos por Categoria */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-500" />
            Gastos por Categoria
          </h3>
          
          <div className="space-y-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="h-4 w-24 bg-slate-100 rounded" />
                  <div className="h-3 w-full bg-slate-50 rounded" />
                </div>
              ))
            ) : stats?.byCategory && stats.byCategory.length > 0 ? (
              stats.byCategory.map((cat) => (
                <div key={cat.name} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-slate-600 group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </span>
                    <span className="text-sm font-medium text-slate-500">
                      {formatCurrency(cat.total)}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(cat.total / (maxCategoryTotal || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <ClipboardList className="w-12 h-12 mb-2 opacity-20" />
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </div>
        </div>

        {/* Card de Ações Rápidas */}
        <div className="space-y-6">
          <div className=" bg-violet-700 rounded-2xl p-8 text-white shadow-lg shadow-indigo-200">
            <h3 className="text-xl font-bold mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              {user?.role === 'COLABORADOR' && (
                <QuickActionButton 
                  onClick={() => navigate(PATH_ROUTES.REIMBURSEMENTS)}
                  label="Nova Solicitação"
                />
              )}
              {(user?.role === 'GESTOR' || user?.role === 'ADMIN') && (
                <QuickActionButton 
                  onClick={() => navigate(PATH_ROUTES.REIMBURSEMENTS + '?status=ENVIADO')}
                  label="Analisar Pendências"
                />
              )}
              {(user?.role === 'FINANCEIRO' || user?.role === 'ADMIN') && (
                <QuickActionButton 
                  onClick={() => navigate(PATH_ROUTES.REIMBURSEMENTS + '?status=APROVADO')}
                  label="Realizar Pagamentos"
                />
              )}
              {user?.role === 'ADMIN' && (
                <>
                  <QuickActionButton 
                    onClick={() => navigate('/users')}
                    label="Gerenciar Usuários"
                  />
                  <QuickActionButton 
                    onClick={() => navigate('/categories')}
                    label="Gerenciar Categorias"
                  />
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

function QuickActionButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button 
      onClick={onClick}
      variant="secondary"
      className="w-full justify-between bg-white/10 hover:bg-white/20 border-white/10 text-white font-semibold py-6 rounded-xl transition-all hover:translate-x-1"
    >
      {label}
      <ArrowUpRight className="w-5 h-5" />
    </Button>
  );
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: any;
  color?: 'indigo' | 'emerald' | 'amber' | 'blue';
  loading?: boolean;
}

function StatsCard({ title, value, icon: Icon, color = 'indigo', loading }: StatsCardProps) {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
        <div className="h-4 w-24 bg-slate-100 rounded mb-4" />
        <div className="h-8 w-16 bg-slate-200 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl border ${colorMap[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold text-slate-800 tracking-tight">
        {value}
      </div>
    </div>
  );
}

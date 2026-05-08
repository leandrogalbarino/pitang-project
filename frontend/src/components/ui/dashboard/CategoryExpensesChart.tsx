import { TrendingUp, ClipboardList } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CategoryStat {
  name: string;
  total: number;
}

interface CategoryExpensesChartProps {
  data?: CategoryStat[];
  isLoading: boolean;
}

export function CategoryExpensesChart({ data, isLoading }: CategoryExpensesChartProps) {
  const maxCategoryTotal = data?.length
    ? Math.max(...data.map((c) => c.total))
    : 0;

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-indigo-500" />
        Gastos por Categoria
      </h3>

      <div className="space-y-6">
        {isLoading ? (
          <LoadingSkeleton />
        ) : data && data.length > 0 ? (
          data.map((cat) => (
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
                  style={{
                    width: `${(cat.total / (maxCategoryTotal || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="space-y-2 animate-pulse">
          <div className="h-4 w-24 bg-slate-100 rounded" />
          <div className="h-3 w-full bg-slate-50 rounded" />
        </div>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <ClipboardList className="w-12 h-12 mb-2 opacity-20" />
      <p>Nenhum dado disponível</p>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { PATH_ROUTES } from '@/constants/routesConstants';
import { useAuth } from '@/contexts/AuthContext';

export function Hero() {
  const { signed } = useAuth();

  return (
    <section className="pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Gestão Inteligente de Despesas
          </div>
          <h1 className="text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Gerencie seus reembolsos com <span className="text-primary italic">precisão.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
            A plataforma definitiva para empresas que buscam agilidade no fluxo de reembolsos e transparência financeira total.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all">
              <Link to={signed ? PATH_ROUTES.DASHBOARD : PATH_ROUTES.LOGIN}>
                {signed ? 'Ir para Dashboard' : 'Acessar Plataforma'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg border-slate-200">
              Ver demonstração
            </Button>
          </div>
          <div className="flex items-center gap-8 pt-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" />
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-900">+500</span> colaboradores já utilizam
            </p>
          </div>
        </div>

        <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 space-y-6">
             <div className="flex items-center justify-between">
               <div className="space-y-1">
                 <div className="h-4 w-24 bg-slate-100 rounded" />
                 <div className="h-6 w-32 bg-slate-200 rounded" />
               </div>
               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="h-24 bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div className="h-3 w-1/2 bg-slate-200 rounded" />
                  <div className="h-5 w-3/4 bg-slate-300 rounded" />
               </div>
               <div className="h-24 bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div className="h-3 w-1/2 bg-slate-200 rounded" />
                  <div className="h-5 w-3/4 bg-slate-300 rounded" />
               </div>
             </div>
             <div className="space-y-3">
               {[1, 2, 3].map(i => (
                 <div key={i} className="flex items-center justify-between p-3 border border-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100" />
                      <div className="h-3 w-20 bg-slate-100 rounded" />
                    </div>
                    <div className="h-3 w-12 bg-slate-100 rounded" />
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

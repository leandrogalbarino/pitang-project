import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PATH_ROUTES } from '@/constants/routesConstants';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { signed } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Pitang Reembolso</span>
        </div>
        <div className="flex items-center gap-6">
          {!signed ? (
            <>
              <Link 
                to={PATH_ROUTES.LOGIN} 
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                Entrar
              </Link>
              <Button asChild size="sm" className="rounded-full px-5">
                <Link to={PATH_ROUTES.LOGIN}>Começar agora</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="sm" variant="outline" className="rounded-full px-5 border-primary text-primary hover:bg-primary/5">
              <Link to={PATH_ROUTES.DASHBOARD}>Acessar Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PATH_ROUTES } from '@/constants/routesConstants';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<'COLABORADOR' | 'GESTOR' | 'FINANCEIRO' | 'ADMIN'>;
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={PATH_ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}

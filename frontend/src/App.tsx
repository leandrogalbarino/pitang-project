import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CategoriesList from './pages/categories/CategoriesList';
import UsersList from './pages/users/UsersList';
import ReimbursementsList from './pages/reimbursements/ReimbursementsList';
import { validateToken } from './lib/auth-utils';
import { PATH_ROUTES } from './constants/routesConstants';
import { RoleGuard } from './components/auth/RoleGuard';
import { Toaster } from './components/ui/sonner';
import { DashboardLayout } from './components/layouts/DashboardLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { signed, loading, signOut } = useAuth();
  const token = localStorage.getItem('@Pitang:token');

  const isValid = validateToken(token);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    );
  }

  if (!signed || !isValid) {
    if (!isValid && token) signOut();
    return <Navigate to={PATH_ROUTES.LOGIN} />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path={PATH_ROUTES.HOME} element={<Home />} />
        <Route path={PATH_ROUTES.LOGIN} element={<Login />} />

        {/* Rotas Protegidas com Layout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path={PATH_ROUTES.DASHBOARD} element={<Dashboard />} />
          
          <Route
            path={PATH_ROUTES.REIMBURSEMENTS}
            element={<ReimbursementsList />}
          />

          <Route
            path={PATH_ROUTES.CATEGORIES}
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <CategoriesList />
              </RoleGuard>
            }
          />

          <Route
            path={PATH_ROUTES.USERS}
            element={
              <RoleGuard allowedRoles={['ADMIN']}>
                <UsersList />
              </RoleGuard>
            }
          />
        </Route>

        {/* Redirecionamento padrão */}
        <Route path="*" element={<Navigate to={PATH_ROUTES.HOME} />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

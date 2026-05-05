import {
  LayoutDashboard,
  FileText,
  Tags,
  Users,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Settings,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { UserForm } from '@/pages/users/components/UserForm';
import { ConfirmActionDialog } from '@/components/dashboard/ConfirmActionDialog';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import type { UserPayload } from '@/contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PATH_ROUTES } from '@/constants/routesConstants';

interface SidebarProps {
  user: UserPayload | null;
  signOut: () => void;
}

export function Sidebar({ user, signOut }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleProfileSuccess = () => {
    setIsProfileOpen(false);
    toast.success('Perfil atualizado!', {
      description:
        'Suas informações foram salvas com sucesso. Faça login novamente para refletir as mudanças se necessário.',
    });
  };

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSelf = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/users/${user?.id}`);
      toast.success('Conta excluída', {
        description: 'Sua conta foi removida com sucesso. Até logo!',
      });
      signOut();
      navigate(PATH_ROUTES.LOGIN);
    } catch (error) {
      console.error('Erro ao excluir conta', error);
      toast.error('Erro ao excluir conta', {
        description:
          'Não foi possível excluir sua conta. Tente novamente mais tarde.',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  const menuItems = [
    {
      name: 'Geral',
      icon: LayoutDashboard,
      path: PATH_ROUTES.DASHBOARD,
      roles: ['ADMIN', 'GESTOR', 'FINANCEIRO', 'COLABORADOR'],
    },
    {
      name:
        user?.role === 'GESTOR'
          ? 'Aprovações'
          : user?.role === 'FINANCEIRO'
            ? 'Pagamentos'
            : 'Reembolsos',
      icon: FileText,
      path: PATH_ROUTES.REIMBURSEMENTS,
      roles: ['ADMIN', 'GESTOR', 'FINANCEIRO', 'COLABORADOR'],
    },


    {
      name: 'Categorias',
      icon: Tags,
      path: PATH_ROUTES.CATEGORIES,
      roles: ['ADMIN'],
    },
    {
      name: 'Usuários',
      icon: Users,
      path: PATH_ROUTES.USERS,
      roles: ['ADMIN'],
    },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role || ''),
  );

  return (
    <aside className="w-64 bg-white border-r flex flex-col p-6 space-y-8">
      <Link to={PATH_ROUTES.HOME} className="flex items-center gap-3 px-2">
        <div className="bg-primary p-2 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight">Pitang</span>
      </Link>

      <nav className="flex-1 space-y-1">
        {filteredMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-slate-400 group-hover:text-primary'
                  }`}
                />
                {item.name}
              </div>
              <ChevronRight
                className={`w-4 h-4 transition-all ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              />
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t space-y-4">
        <div className="flex items-center justify-between px-3">
          <div className="flex-1 truncate mr-2">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {user?.role.toLowerCase()}
            </p>
          </div>

          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-primary shrink-0"
              onClick={() => setIsProfileOpen(true)}
              title="Editar perfil"
            >
              <Settings className="w-4 h-4" />
            </Button>

            {isProfileOpen && (
              <UserForm
                user={user as any}
                onSuccess={handleProfileSuccess}
                onCancel={() => setIsProfileOpen(false)}
              />
            )}
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-destructive shrink-0"
            onClick={() => setIsDeleteOpen(true)}
            title="Excluir minha conta"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <ConfirmActionDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            onConfirm={handleDeleteSelf}
            isLoading={isDeleting}
            variant="destructive"
            title="Tem certeza absoluta?"
            confirmText="Sim, excluir minha conta"
            description={
              <>
                Esta ação <strong>não pode ser revertida</strong>. Isso excluirá
                permanentemente sua conta e removerá seus dados de nossos
                servidores.
              </>
            }
          />
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5 rounded-lg"
          onClick={() => {
            signOut();
            navigate(PATH_ROUTES.LOGIN);
          }}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair da conta
        </Button>
      </div>
    </aside>
  );
}

import type { User } from '@/types/userTypes';

export const roleLabels = {
  COLABORADOR: 'Colaborador',
  GESTOR: 'Gestor',
  FINANCEIRO: 'Financeiro',
  ADMIN: 'Administrador',
};

export function UserRoleBadge({ role }: { role: User['role'] }) {
  return (
    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
      {roleLabels[role]}
    </span>
  );
}

export function UserStatusBadge({ active }: { active: boolean }) {
  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-green-100 text-green-800'
          : 'bg-slate-100 text-slate-800'
      }`}
    >
      {active ? 'Ativo' : 'Inativo'}
    </div>
  );
}

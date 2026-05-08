export function StatusBadge({ active }: { active: boolean }) {
  return (
    <div
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
        active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {active ? 'Ativo' : 'Inativo'}
    </div>
  );
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/types/categoriesTypes';

interface ReimbursementFiltersProps {
  statusValue: string;
  categoryValue: string;
  orderValue: string;
  orderDirectionValue: string;
  onFilterChange: (updates: Record<string, string>) => void;
  categories: Category[];
}

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  value: string;
  placeholder: string;
  key: string;
  options: FilterOption[];
  defaultValue?: string;
}

export function ReimbursementFilters({
  statusValue,
  categoryValue,
  orderValue,
  orderDirectionValue,
  onFilterChange,
  categories,
}: ReimbursementFiltersProps) {
  
  const filterConfigs: FilterConfig[] = [
    {
      value: statusValue,
      placeholder: 'Filtrar por Status',
      key: 'status',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'Todos os Status' },
        { value: 'RASCUNHO', label: 'Rascunho' },
        { value: 'ENVIADO', label: 'Enviado' },
        { value: 'APROVADO', label: 'Aprovado' },
        { value: 'REJEITADO', label: 'Rejeitado' },
        { value: 'PAGO', label: 'Pago' },
        { value: 'CANCELADO', label: 'Cancelado' },
      ],
    },
    {
      value: categoryValue,
      placeholder: 'Filtrar por Categoria',
      key: 'category',
      defaultValue: 'all',
      options: [
        { value: 'all', label: 'Todas as Categorias' },
        ...categories.map((cat) => ({ value: cat.name, label: cat.name })),
      ],
    },
    {
      value: orderValue,
      placeholder: 'Ordenar por',
      key: 'order',
      defaultValue: 'date',
      options: [
        { value: 'date', label: 'Data' },
        { value: 'amount', label: 'Valor' },
      ],
    },
    {
      value: orderDirectionValue,
      placeholder: 'Direção',
      key: 'orderDirection',
      defaultValue: 'desc',
      options: [
        { value: 'desc', label: 'Decrescente' },
        { value: 'asc', label: 'Crescente' },
      ],
    },
  ];

  const handleValueChange = (key: string, val: string) => {
    // Para filtros que usam 'all', enviamos string vazia para o backend
    const isSpecialAll = (key === 'status' || key === 'category') && val === 'all';
    onFilterChange({ [key]: isSpecialAll ? '' : val });
  };

  return (
    <div className="flex flex-wrap gap-4 pb-4">
      {filterConfigs.map((config) => (
        <div key={config.key} className="w-[180px]">
          <Select
            value={config.value || config.defaultValue}
            onValueChange={(val) => handleValueChange(config.key, val)}
          >
            <SelectTrigger className="bg-slate-50 border-none w-[180px]">
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {config.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
}

import { Tag, DollarSign, Calendar, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Reimbursement } from '@/types/reimbursementTypes';

interface DetailsSummaryProps {
  reimbursement: Reimbursement;
}

export function DetailsSummary({ reimbursement }: DetailsSummaryProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <SummaryCard
        label="Categoria"
        value={reimbursement.category?.name}
        icon={Tag}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
      />
      
      <SummaryCard
        label="Valor Total"
        value={formatCurrency(reimbursement.amount)}
        icon={DollarSign}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      
      <SummaryCard
        label="Data da Despesa"
        value={formatDate(reimbursement.expenseDate)}
        icon={Calendar}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
      />

      <SummaryCard
        label="Solicitante"
        value={reimbursement.user?.name}
        icon={User}
        iconBg="bg-orange-50"
        iconColor="text-orange-600"
        truncate
      />
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value?: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  truncate?: boolean;
}

function SummaryCard({ label, value, icon: Icon, iconBg, iconColor, truncate }: SummaryCardProps) {
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 ${iconBg} rounded-lg ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
          <p className={`text-sm font-bold text-slate-900 ${truncate ? 'truncate max-w-[120px]' : ''}`}>
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

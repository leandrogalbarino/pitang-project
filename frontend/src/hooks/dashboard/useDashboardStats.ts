import useSWR from 'swr';

interface CategoryStat {
  name: string;
  total: number;
}

interface DashboardStats {
  totalRequests: number;
  totalAmount: number;
  totalAmountPaid: number;
  pendingApproval: number;
  pendingPayment: number;
  paid: number;
  byCategory: CategoryStat[];
}

export function useDashboardStats() {
  const { data, error, isLoading, mutate } = useSWR<DashboardStats>('/dashboard/stats');

  return {
    stats: data,
    isLoading,
    error,
    mutate,
  };
}

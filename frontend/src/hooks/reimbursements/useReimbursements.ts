import useSWR from 'swr';
import type { ReimbursementListResponse } from '@/types/reimbursementTypes';

interface ReimbursementFilters {
  page: number;
  search: string;
  status: string;
  category: string;
  order: string;
  orderDirection: string;
}

export function useReimbursements(filters: ReimbursementFilters) {
  const { data, error, isLoading, mutate } = useSWR<ReimbursementListResponse>(() => {
    const params = new URLSearchParams();
    if (filters.page > 1) params.set('page', String(filters.page));
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.order) params.set('order', filters.order);
    if (filters.orderDirection) params.set('orderDirection', filters.orderDirection);
    
    const query = params.toString();
    return `/reimbursements${query ? `?${query}` : ''}`;
  });

  return {
    reimbursements: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

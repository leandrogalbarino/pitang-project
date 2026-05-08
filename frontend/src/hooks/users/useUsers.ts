import useSWR from 'swr';
import type { UsersListResponse } from '@/types/userTypes';

interface UserFilters {
  page: number;
  search: string;
}

export function useUsers(filters: UserFilters) {
  const { data, error, isLoading, mutate } = useSWR<UsersListResponse>(() => {
    const params = new URLSearchParams();
    if (filters.page > 1) params.set('page', String(filters.page));
    if (filters.search) params.set('search', filters.search);
    const query = params.toString();
    return `/users${query ? `?${query}` : ''}`;
  });

  return {
    users: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

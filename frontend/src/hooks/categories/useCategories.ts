import useSWR from 'swr';
import type { CategoriesResponse } from '@/types/categoriesTypes';

interface CategoryFilters {
  page: number;
  search: string;
}

export function useCategories(filters: CategoryFilters) {
  const { data, error, isLoading, mutate } = useSWR<CategoriesResponse>(() => {
    const params = new URLSearchParams();
    if (filters.page > 1) params.set('page', String(filters.page));
    if (filters.search) params.set('search', filters.search);
    const query = params.toString();
    return `/categories${query ? `?${query}` : ''}`;
  });

  return {
    categories: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  };
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  status: number;
  fields?: Record<string, string[]>;
}

interface RequestOptions extends RequestInit {
  data?: any;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { data, headers, ...rest } = options;
  const token = localStorage.getItem('@Pitang:token');

  const isFormData = data instanceof FormData;

  const config: RequestInit = {
    ...rest,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (data) {
    config.body = isFormData ? data : JSON.stringify(data);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 204) {
    return {} as T;
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const hasFieldErrors =
      (response.status === 400 || response.status === 409) &&
      result.data &&
      !Array.isArray(result.data);

    if (response.status === 401) {
      localStorage.removeItem('@Pitang:token');
      localStorage.removeItem('@Pitang:user');
      // window.location.href = '/login';
    }

    throw {
      message: result.message || 'Erro na requisição',
      status: response.status,
      fields: hasFieldErrors ? result.data : result.fields,
    } as ApiError;
  }

  if (result.data && typeof result.statusCode === 'number') {
    return result.data as T;
  }

  return result as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', data }),

  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', data }),
  patch: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', data }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { type ApiError } from './api-client';


export function handleApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
): boolean {
  const apiError = error as ApiError;
  
  if (apiError && apiError.fields) {
    Object.entries(apiError.fields).forEach(([field, messages]) => {
      setError(field as Path<T>, {
        type: 'manual',
        message: Array.isArray(messages) ? messages[0] : messages,
      });
    });
    return true;
  }
  
  return false;
}

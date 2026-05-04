import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import { Input } from './input';
import { Label } from './label';

interface InputGroupProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  autoFocus?: boolean;
  registration: UseFormRegisterReturn;
}

export function InputGroup({
  label,
  id,
  type = 'text',
  placeholder,
  error,
  disabled,
  autoFocus,
  registration,
}: InputGroupProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        {...registration}
        className={error ? 'border-destructive' : ''}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      {error && (
        <p className="text-xs text-destructive font-medium">{error.message}</p>
      )}
    </div>
  );
}

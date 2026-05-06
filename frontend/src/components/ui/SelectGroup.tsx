import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from './select';
import { Controller, type FieldError } from 'react-hook-form';

interface SelectGroupProps {
  label: string;
  name: string;
  control: any;
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  children: React.ReactNode;
}

export function SelectGroup({
  label,
  name,
  control,
  placeholder = "Selecione uma opção",
  error,
  disabled,
  children,
}: SelectGroupProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select 
            value={field.value !== undefined && field.value !== null ? String(field.value) : undefined} 
            onValueChange={(val) => {
              if (val === 'true') field.onChange(true);
              else if (val === 'false') field.onChange(false);
              else field.onChange(val);
            }} 
            disabled={disabled}
          >
            <SelectTrigger id={name} className={error ? 'border-destructive' : ''}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {children}
            </SelectContent>
          </Select>
        )}
      />
      {error && (
        <p className="text-xs text-destructive font-medium">
          {error.message}
        </p>
      )}
    </div>
  );
}

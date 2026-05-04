import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Textarea } from "./textarea";
import { Label } from "./label";

interface TextAreaGroupProps {
  label: string;
  id: string;
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  autoFocus?: boolean;
  registration: UseFormRegisterReturn;
}

export function TextAreaGroup({
  label,
  id,
  placeholder,
  error,
  disabled,
  autoFocus,
  registration,
}: TextAreaGroupProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        placeholder={placeholder}
        {...registration}
        className={error ? 'border-destructive' : ''}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      {error && (
        <p className="text-xs text-destructive font-medium">
          {error.message}
        </p>
      )}
    </div>
  );
}

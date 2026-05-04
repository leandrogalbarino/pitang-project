import { SelectItem } from '@/components/ui/select';
import { SelectGroup } from '@/components/ui/SelectGroup';
import type { Category } from '@/types/categoriesTypes';
import type { Control, FieldError } from 'react-hook-form';

interface CategorySelectProps {
  control: Control<any>;
  categories: Category[];
  error?: FieldError;
  disabled?: boolean;
}
export function CategorySelectGroup({
  control,
  categories,
  error,
  disabled,
}: CategorySelectProps) {
  return (
    <SelectGroup
      label="Categoria"
      name="categoryId"
      control={control}
      error={error}
      disabled={disabled}
      placeholder="Selecione uma categoria"
    >
      {categories.map((category) => (
        <SelectItem key={category.id} value={category.id}>
          {category.name}
        </SelectItem>
      ))}
    </SelectGroup>
  );
}

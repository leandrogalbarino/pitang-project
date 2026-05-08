import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, type ApiError } from '@/lib/api-client';
import type { CategoryFormProps } from '@/types/categoriesTypes';
import {
  categorySchema,
  type CategoryFormData,
} from '@/schemas/categorySchema';
import { toast } from 'sonner';
import { FormModalLayout } from '@/components/ui/dashboard/FormModalLayout';
import { handleApiErrors } from '@/lib/form-utils';
import { InputGroup } from '@/components/ui/InputGroup';
import { SelectGroup } from '@/components/ui/SelectGroup';
import { SelectItem } from '@/components/ui/select';

export function CategoryForm({
  category,
  onSuccess,
  onCancel,
}: CategoryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      amountMax: category?.amountMax,
      active: category?.active ?? true,
    },
  });

  useEffect(() => {
    clearErrors();
    reset({
      name: category ? category.name : '',
      amountMax: category ? category?.amountMax : 300,
      active: category ? category.active : true,
    });

    return () => {
      reset({ name: '' });
      clearErrors();
    };
  }, [category, reset, clearErrors]);

  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    try {
      setIsSubmitting(true);

      if (category) {
        await api.put(`/categories/${category.id}`, data);
        onSuccess();
        return;
      }

      await api.post('/categories', data);
      onSuccess();
    } catch (error) {
      if (handleApiErrors(error, setError)) return;
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao salvar categoria');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = category ? 'Editar Categoria' : 'Nova Categoria';
  const description = category
    ? 'Altere o nome da categoria selecionada.'
    : 'Adicione uma nova categoria para classificar os reembolsos.';

  return (
    <FormModalLayout
      title={title}
      description={description}
      onCancel={onCancel}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={category ? 'Salvar Categoria' : 'Criar Categoria'}
      maxWidth="sm:max-w-[425px]"
    >
      <InputGroup
        label="Nome da Categoria"
        id="name"
        placeholder="Ex: Alimentação, Transporte"
        registration={register('name')}
        error={errors.name}
        autoFocus
      />
      <InputGroup
        label="Valor Máximo (R$)"
        id="amountMax"
        type="number"
        placeholder="0.00"
        registration={register('amountMax', { valueAsNumber: true })}
        error={errors.amountMax}
      />
      {category && !category.active && (
        <SelectGroup
          label="Status da Categoria"
          name="active"
          control={control}
          error={errors.active}
          placeholder="Selecione o status"
        >
          <SelectItem value="true">Ativo</SelectItem>
          <SelectItem value="false">Inativo</SelectItem>
        </SelectGroup>
      )}
    </FormModalLayout>
  );
}

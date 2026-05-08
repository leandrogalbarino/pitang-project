import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api, type ApiError } from '@/lib/api-client';
import { useAuth } from '@/contexts/AuthContext';
import { userSchema, type UserFormData } from '@/schemas/usersSchema';
import type { UserFormProps } from '@/types/userTypes';
import { FormModalLayout } from '@/components/ui/dashboard/FormModalLayout';
import { toast } from 'sonner';
import { SelectGroup } from '@/components/ui/SelectGroup';
import { InputGroup } from '@/components/ui/InputGroup';
import { SelectItem } from '@/components/ui/select';
import { handleApiErrors } from '@/lib/form-utils';

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { user: loggedInUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!user;
  const isSelf = loggedInUser?.id === user?.id;

  const canEditPersonalInfo = !isEditing || isSelf;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'COLABORADOR',
      password: '',
      password2: '',
      active: true,
    },
  });

  useEffect(() => {
    clearErrors();
    reset({
      name: user ? user.name : '',
      email: user ? user.email : '',
      role: user ? user.role : 'COLABORADOR',
      active: user ? user.active : true,
      password: '',
      password2: '',
    });

    return () => {
      reset();
      clearErrors();
    };
  }, [user, reset, clearErrors]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);

      const payload = { ...data };
      if (user && !payload.password) {
        delete payload.password;
      }

      if (user) {
        await api.patch(`/users/${user.id}`, payload);
        onSuccess();
        return;
      }

      if (!payload.password) {
        setError('password', {
          message: 'A senha é obrigatória para novos usuários',
        });
        setIsSubmitting(false);
        return;
      }

      await api.post('/users', payload);
      onSuccess();
    } catch (error) {
      if (handleApiErrors(error, setError)) return;
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao salvar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = isEditing
    ? isSelf
      ? 'Meu Perfil'
      : 'Editar Usuário'
    : 'Novo Usuário';
  const description = isEditing
    ? isSelf
      ? 'Altere seus dados pessoais e perfil.'
      : 'Como administrador, você pode apenas alterar o perfil deste usuário.'
    : 'Adicione um novo usuário ao sistema.';

  return (
    <FormModalLayout
      title={title}
      description={description}
      onCancel={onCancel}
      onSubmit={handleSubmit(onSubmit)}
      isSubmitting={isSubmitting}
      submitLabel={isEditing ? 'Salvar Alterações' : 'Salvar Usuário'}
    >
      <InputGroup
        label="Nome Completo"
        id="name"
        placeholder="Ex: João Silva"
        registration={register('name')}
        error={errors.name}
        disabled={!canEditPersonalInfo}
        autoFocus={!isEditing}
      />

      <InputGroup
        label="E-mail"
        id="email"
        type="email"
        placeholder="joao@empresa.com"
        registration={register('email')}
        error={errors.email}
        disabled={!canEditPersonalInfo}
      />

      <SelectGroup
        label="Perfil de Acesso"
        name="role"
        control={control}
        error={errors.role}
        disabled={isSelf}
        placeholder="Selecione um perfil"
      >
        <SelectItem value="COLABORADOR">Colaborador</SelectItem>
        <SelectItem value="GESTOR">Gestor</SelectItem>
        <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
        <SelectItem value="ADMIN">Administrador</SelectItem>
      </SelectGroup>
      {loggedInUser?.role === 'ADMIN' && user && !isSelf && !user?.active && (
        <SelectGroup
          label="Status da Conta"
          name="active"
          control={control}
          error={errors.active}
          disabled={isSelf}
          placeholder="Selecione o status"
        >
          <SelectItem value="true">Ativo</SelectItem>
          <SelectItem value="false">Inativo</SelectItem>
        </SelectGroup>
      )}
      <InputGroup
        label={user ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
        id="password"
        type="password"
        placeholder="******"
        registration={register('password')}
        error={errors.password}
        disabled={!canEditPersonalInfo}
      />

      <InputGroup
        label="Confirmar Senha"
        id="confirmPassword"
        type="password"
        placeholder="******"
        registration={register('password2')}
        error={errors.password2}
        disabled={!canEditPersonalInfo}
      />
    </FormModalLayout>
  );
}

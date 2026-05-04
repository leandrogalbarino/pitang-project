import type { Response } from 'express';
import { ZodError } from 'zod';
import { STATUS_CODE } from './constants';

export const successData = (response: Response, data: any) => {
  return response.status(STATUS_CODE.HTTP_OK_200).json({
    message: 'Operação realizada com sucesso!',
    data,
    statusCode: 200,
  });
};

export const successCreated = (
  response: Response,
  message: string,
  data?: any,
) => {
  return response.status(STATUS_CODE.HTTP_CREATED_201).json({
    message,
    data,
    statusCode: 201,
  });
};

export const successDelete204 = (response: Response) => {
  return response.status(STATUS_CODE.HTTP_NO_CONTENT_204).send();
};

export const clientFieldsError400 = (
  response: Response,
  fieldsErrors: Record<string, string[] | undefined>,
) => {
  return response.status(STATUS_CODE.HTTP_CLIENT_ERROR_400).json({
    message: 'Campo(s) inválido(s).',
    data: fieldsErrors,
    status: 400,
  });
};
export const clientError400 = (response: Response, message: string) => {
  return response.status(STATUS_CODE.HTTP_CLIENT_ERROR_400).json({
    message,
    statusCode: 400,
  });
};

export const clientErrorConflict409 = (
  response: Response,
  message: string,
  fieldsErrors?: Record<string, string[] | undefined>,
) => {
  return response.status(STATUS_CODE.HTTP_CONFLICT_409).json({
    message,
    data: fieldsErrors,
    statusCode: 409,
  });
};

export const notFound404 = (response: Response, message: string) => {
  return response.status(STATUS_CODE.HTTP_NOT_FOUND_404).json({
    message,
    statusCode: 404,
  });
};

export const userNotAuthenticated401 = (
  response: Response,
  message: string,
) => {
  return response.status(STATUS_CODE.HTTP_NOT_AUTHENTICATED_401).json({
    message,
    statusCode: 401,
  });
};

export const userUnauthorized403 = (response: Response, message: string) => {
  return response.status(STATUS_CODE.HTTP_UNAUTHORIZED_403).json({
    message,
    statusCode: 403,
  });
};

export const serverError500 = (response: Response) => {
  return response.status(STATUS_CODE.HTTP_SERVER_ERROR_500).json({
    message: 'Alguma coisa aconteceu no servidor!',
    statusCode: 500,
  });
};

/**
 * Handler centralizado para erros do Zod
 */
export const handleValidationError = (response: Response, error: ZodError) => {
  const flattened = error.flatten();
  const fieldErrors = flattened.fieldErrors;
  const formErrors = flattened.formErrors;

  // Se houver uma mensagem de erro genérica no schema (ex: .refine)
  const messageError =
    (fieldErrors as Record<string, string[] | undefined>).message?.[0] ||
    formErrors[0];

  if (messageError) {
    return clientError400(response, messageError);
  }

  // Caso contrário, retorna os erros por campo
  return clientFieldsError400(response, fieldErrors);
};

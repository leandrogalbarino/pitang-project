import type { Request, Response } from 'express';
import { prisma } from '../../core/prismaClient';
import * as res from '../../utils/responseHttp';
import { CategorySchema, uuidParam, PaginationSchema } from '../../schemas';
import { getPagination, formatPaginatedResponse } from '../../utils/pagination';

/**
 * Lista todas as categorias.
 */
export const getCategories = async (request: Request, response: Response) => {
  try {
    const validatedPagination = PaginationSchema.safeParse(request.query);
    const { page, limit } = validatedPagination.success
      ? validatedPagination.data
      : { page: 1, limit: 10 };

    const { skip, take } = getPagination(page, limit);

    const { search } = request.query;
    let whereClause: any = { active: true };

    if (search) {
      whereClause = {
        AND: [
          whereClause,
          {
            name: { contains: String(search), mode: 'insensitive' },
          },
        ],
      };
    }

    const [total, result] = await Promise.all([
      prisma.category.count({ where: whereClause }),
      prisma.category.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
    ]);

    return res.successData(
      response,
      formatPaginatedResponse(result, total, page, limit),
    );
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Cria uma nova categoria.
 */
export const createCategory = async (request: Request, response: Response) => {
  try {
    const validatedData = CategorySchema.safeParse(request.body);
    if (!validatedData.success) {
      return res.handleValidationError(response, validatedData.error);
    }

    const { name, active, amountMax } = validatedData.data;

    // Verificar se já existe
    const existing = await prisma.category.findFirst({
      where: { name },
    });

    if (existing) {
      return res.clientErrorConflict409(
        response,
        'Já existe uma categoria com este nome.',
        {
          name: ['Já existe uma categoria com este nome.'],
        },
      );
    }

    await prisma.category.create({
      data: validatedData.data,
    });

    return res.successCreated(response, 'Categoria criada com sucesso.');
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Atualiza uma categoria.
 */
export const updateCategory = async (request: Request, response: Response) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    const validatedData = CategorySchema.safeParse(request.body);
    if (!validatedData.success) {
      return res.handleValidationError(response, validatedData.error);
    }

    const category = await prisma.category.findUnique({
      where: { id: validatedId.data.id },
    });

    if (!category) {
      return res.notFound404(response, 'Categoria não encontrada.');
    }

    // Correção: Ignora o ID atual para permitir atualização de status sem conflito de nome
    if (validatedData.data.name) {
      const existing = await prisma.category.findFirst({
        where: {
          name: validatedData.data.name,
          NOT: { id: validatedId.data.id },
        },
      });

      if (existing) {
        return res.clientErrorConflict409(
          response,
          'Já existe uma categoria com este nome.',
          {
            name: ['Já existe uma categoria com este nome.'],
          },
        );
      }
    }

    const updated = await prisma.category.update({
      where: { id: validatedId.data.id },
      data: validatedData.data,
    });

    return res.successData(response, updated);
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Obtém uma categoria específica.
 */
export const getSingleCategory = async (
  request: Request,
  response: Response,
) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    const category = await prisma.category.findUnique({
      where: { id: validatedId.data.id },
    });

    if (!category) {
      return res.notFound404(response, 'Categoria não encontrada.');
    }

    return res.successData(response, category);
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

/**
 * Deleta (soft delete) uma categoria.
 */
export const deleteCategory = async (request: Request, response: Response) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);
    if (!validatedId.success) {
      return res.clientError400(response, 'ID inválido.');
    }

    await prisma.category.update({
      where: { id: validatedId.data.id },
      data: { active: false },
    });

    return res.successDelete204(response);
  } catch (error) {
    console.error(error);
    return res.serverError500(response);
  }
};

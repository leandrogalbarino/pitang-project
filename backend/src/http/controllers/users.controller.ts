import type { Request, Response } from 'express';
import { prisma } from '../../core/prismaClient';
import jwt from 'jsonwebtoken';

import * as res from '../../utils/responseHttp';
import {
  LoginSchema,
  User,
  UserListSchema,
  UserRegistrationSchema,
  UserResponseSchema,
  UserUpdateSchema,
  uuidParam,
  PaginationSchema,
  UserAdminUpdateSchema,
} from '../../schemas';
import { getPagination, formatPaginatedResponse } from '../../utils/pagination';

import bcrypt from 'bcrypt';
import { Prisma } from '../../../generated/prisma';
import { environment } from '../../core/environmentEnv';

export const userLogin = async (request: Request, response: Response) => {
  try {
    const data = request.body;
    const validatedData = LoginSchema.safeParse(data);
    if (!validatedData.success) {
      return res.handleValidationError(response, validatedData.error);
    }
    const { email, password } = validatedData.data;

    const user = await prisma.user.findFirst({
      where: {
        email: email,
        active: true,
      },
    });

    if (!user) {
      return res.clientError400(response, 'Credenciais inválidas.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.clientError400(response, 'Credenciais inválidas.');
    }

    const userInToken = UserResponseSchema.parse(user);
    const privateKey = environment.JWT_PRIVATE_KEY;

    const token = jwt.sign(userInToken, privateKey, { expiresIn: '24h' });

    return res.successData(response, { token: token });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    return res.serverError500(response);
  }
};

export const userRegister = async (request: Request, response: Response) => {
  try {
    const data = request.body;

    const result = UserRegistrationSchema.safeParse(data);

    if (!result.success) {
      return res.handleValidationError(response, result.error);
    }
    // Verificar se um usuário com este email já existe
    const existUserInDB = await prisma.user.findFirst({
      where: { email: result.data.email },
    });

    if (existUserInDB) {
      return res.clientErrorConflict409(
        response,
        'Usuário com este email já cadastrado.',
        {
          email: ['Já existe um usuário com este email cadastrado.'],
        },
      );
    }

    const { password, password2, ...userToSave } = result.data;
    const saltRounds = 10;
    const passwordHashed = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        ...userToSave,
        password: passwordHashed,
      },
    });

    const userResponse = UserResponseSchema.parse(newUser);

    return res.successCreated(
      response,
      'Usuário registrado com sucesso.',
      userResponse,
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.clientError400(
          response,
          'Este email já está em uso por outro usuário.',
        );
      }
    }

    if (error instanceof Error) {
      console.error(error.message);
    }
    return res.serverError500(response);
  }
};

export const userUpdate = async (request: Request, response: Response) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);

    if (!validatedId.success) {
      return res.clientError400(response, 'Formato de id inválido');
    }

    const userId = validatedId.data.id;

    // Apenas o próprio usuário ou um ADMIN pode atualizar os dados
    if (request.user?.id !== userId && request.user?.role !== 'ADMIN') {
      return res.userUnauthorized403(
        response,
        'Não é possível atualizar dados de outro usuário.',
      );
    }

    const data = request.body;

    const validatedData =
      request.user?.id === userId
        ? UserUpdateSchema.safeParse(data)
        : UserAdminUpdateSchema.safeParse(data);

    if (!validatedData.success) {
      return res.handleValidationError(response, validatedData.error);
    }

    const { password, password2, ...dataToUpdate } = validatedData.data as any;
    const updatePayload: any = { ...dataToUpdate };

    if (password) {
      const saltRounds = 10;
      updatePayload.password = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatePayload,
    });

    const userResponse = UserResponseSchema.parse(updatedUser);
    return res.successData(response, userResponse);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.clientError400(
          response,
          'Este email já está em uso por outro usuário.',
        );
      }
      if (error.code === 'P2025') {
        return res.notFound404(response, 'Usuário não encontrado.');
      }
    }

    if (error instanceof Error) {
      console.error(error.message);
    }
    return res.serverError500(response);
  }
};

export const getUsers = async (request: Request, response: Response) => {
  try {
    const validatedPagination = PaginationSchema.safeParse(request.query);
    const { page, limit } = validatedPagination.success
      ? validatedPagination.data
      : { page: 1, limit: 10 };

    const { skip, take } = getPagination(page, limit);

    const { search } = request.query;
    let whereClause: any = {};

    if (search) {
      whereClause = {
        AND: [
          whereClause,
          {
            OR: [
              { name: { contains: String(search), mode: 'insensitive' } },
              { email: { contains: String(search), mode: 'insensitive' } },
            ],
          },
        ],
      };
    }

    const [total, result] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: [{ active: 'desc' }, { name: 'asc' }],
      }),
    ]);

    const users = UserListSchema.parse(result);
    return res.successData(
      response,
      formatPaginatedResponse(users, total, page, limit),
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }

    return res.serverError500(response);
  }
};

export const getSingleUser = async (request: Request, response: Response) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);

    if (!validatedId.success) {
      return res.clientError400(response, 'Formato de id inválido');
    }

    const user = await prisma.user.findFirst({
      where: { id: validatedId.data.id, active: true },
    });

    if (!user) {
      return res.notFound404(response, 'Usuário não encontrado.');
    }

    const data = UserResponseSchema.parse(user);
    return res.successData(response, data);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }

    return res.serverError500(response);
  }
};

export const userDelete = async (request: Request, response: Response) => {
  try {
    const validatedId = uuidParam.safeParse(request.params);

    if (!validatedId.success) {
      return res.clientError400(response, 'Formato de id inválido');
    }

    // Apenas ADMIN pode deletar usuários, ou o próprio usuário pode se deletar
    if (
      request.user?.id !== validatedId.data.id &&
      request.user?.role !== 'ADMIN'
    ) {
      return res.userUnauthorized403(response, 'Ação não permitida.');
    }

    await prisma.user.update({
      where: { id: validatedId.data.id, active: true },
      data: { active: false },
    });

    return res.successDelete204(response);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return res.notFound404(response, 'Usuário não encontrado.');
      }
    }

    if (error instanceof Error) {
      console.error(error.message);
    }

    return res.serverError500(response);
  }
};

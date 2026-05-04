import type { Request, Response, NextFunction } from 'express';
import type { Role } from '../../../generated/prisma';

import * as res from '../../utils/responseHttp';

export const checkRole = (allowedRoles: Role[]) => {
  return (request: Request, response: Response, next: NextFunction) => {
    const user = request.user;

    if (!user) {
      return res.userNotAuthenticated401(response, 'Usuário não autenticado.');
    }

    if (!allowedRoles.includes(user.role)) {
      return res.userUnauthorized403(
        response,
        'Você não tem permissão para realizar essa ação.',
      );
    }

    next();
  };
};

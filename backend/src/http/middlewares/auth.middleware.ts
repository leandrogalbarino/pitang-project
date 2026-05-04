import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { environment } from '../../core/environmentEnv';
import * as res from '../../utils/responseHttp';

const matchPath = (path: string, pattern: string): boolean => {
  if (pattern.endsWith('/*')) {
    const prefix = pattern.slice(0, -1);
    return path.startsWith(prefix);
  }

  return path === pattern;
};

const allowedPaths = {
  GET: ['/'],
  POST: ['/auth/login'],
} as const;

const authMiddleware = (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const paths = allowedPaths[request.method as keyof typeof allowedPaths] ?? [];

  if (paths.some((path) => matchPath(request.path, path))) {
    return next();
  }

  const authHeader = request.headers.authorization;
  if (!authHeader) {
    return res.userNotAuthenticated401(response, 'Usuário não autenticado.');
  }
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.userNotAuthenticated401(response, 'Usuário não autenticado.');
  }

  try {
    const decoded = jwt.verify(token, environment.JWT_PRIVATE_KEY);
    (request as any).user = decoded;
    next();
  } catch (error) {
    return res.userNotAuthenticated401(response, 'Usuário não autenticado.');
  }
};

export default authMiddleware;

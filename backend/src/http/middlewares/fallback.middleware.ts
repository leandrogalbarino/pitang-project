import type { Request, Response, NextFunction } from 'express';
import { serverError500 } from '../../utils/responseHttp';


const fallbackErrorMiddleware = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  console.error(error.stack);
  return serverError500(response);
};

export default fallbackErrorMiddleware;

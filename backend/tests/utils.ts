import jwt from 'jsonwebtoken';
import { environment } from '../src/core/environmentEnv';

export const generateToken = (user: { id: string; name: string; email: string; role: string }) => {
  return jwt.sign(user, environment.JWT_PRIVATE_KEY);
};

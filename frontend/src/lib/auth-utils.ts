import { jwtDecode } from 'jwt-decode';
import type { UserPayload } from '@/contexts/AuthContext';

export const validateToken = (token: string | null): UserPayload | null => {
  if (!token) return null;

  try {
    const decoded = jwtDecode<UserPayload>(token);
    const currentTime = Date.now() / 1000;

    // Check expiration
    if (decoded.exp && decoded.exp < currentTime) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
};

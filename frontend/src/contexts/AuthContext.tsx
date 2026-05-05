import { validateToken } from '@/lib/auth-utils';
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: 'COLABORADOR' | 'GESTOR' | 'FINANCEIRO' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
  exp: number;
  iat: number;
}

interface AuthContextData {
  user: UserPayload | null;
  signed: boolean;
  signIn(token: string, user: UserPayload): void;
  signOut(): void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storagedUser = localStorage.getItem('@Pitang:user');
    const storagedToken = localStorage.getItem('@Pitang:token');

    if (storagedUser && storagedToken) {
      const isValid = validateToken(storagedToken);
      if (isValid) {
        setUser(JSON.parse(storagedUser));
      } else {
        localStorage.removeItem('@Pitang:token');
        localStorage.removeItem('@Pitang:user');
      }
    }
    setLoading(false);
  }, [setUser]);

  const signIn = (token: string, userData: UserPayload) => {
    localStorage.setItem('@Pitang:token', token);
    localStorage.setItem('@Pitang:user', JSON.stringify(userData));
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem('@Pitang:token');
    localStorage.removeItem('@Pitang:user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ signed: !!user, user, signIn, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

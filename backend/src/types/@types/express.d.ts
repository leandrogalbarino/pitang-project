import * as express from 'express';
import type { Role } from '../../../generated/prisma';

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        name: string;
        role: Role;
        active: boolean;
        updatedAt: Date;
        createdAt: Date;
      };
    }
  }
}

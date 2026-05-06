import express from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import { getDashboardStats } from '../controllers/dashboard.controller';

const dashboardRoutes = express.Router();

// Todas as rotas de dashboard exigem autenticação
dashboardRoutes.use(authMiddleware);

dashboardRoutes.get('/stats', getDashboardStats);

export default dashboardRoutes;

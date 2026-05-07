import express from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';

const dashboardRoutes = express.Router();

dashboardRoutes.get('/stats', getDashboardStats);

export default dashboardRoutes;

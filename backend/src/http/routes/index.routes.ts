import express from 'express';
import userRoutes from './users.routes';
import categoriesRoutes from './categories.routes';
import reimbursementsRoutes from './reimbursements.routes';
import { userLogin } from '../controllers/users.controller';
import dashboardRoutes from './dashboard.routes';


const routes = express.Router();

routes.post('/auth/login', userLogin);

routes.use('/users', userRoutes);
routes.use('/categories', categoriesRoutes);
routes.use('/reimbursements', reimbursementsRoutes);

routes.use('/dashboard', dashboardRoutes);

export default routes;

import express from 'express';
import { checkRole } from '../middlewares/role.middleware';
import { Role } from '../../../generated/prisma';
import {
  createCategory,
  getCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categories.controller';

const categoriesRoutes = express.Router();

// Listar todas as categorias (Pode ser aberto para todos os perfis)

categoriesRoutes.get('/', getCategories);

// Apenas ADMIN pode criar ou editar categorias
categoriesRoutes.use(checkRole([Role.ADMIN]));

categoriesRoutes.post('/', createCategory);
categoriesRoutes.get('/:id', getSingleCategory);
categoriesRoutes.put('/:id', updateCategory);
categoriesRoutes.delete('/:id', deleteCategory);

export default categoriesRoutes;

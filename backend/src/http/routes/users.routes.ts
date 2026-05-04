import express from 'express';
import {
  getSingleUser,
  getUsers,
  userLogin,
  userRegister,
  userDelete,
  userUpdate,
} from '../controllers/users.controller';
import { checkRole } from '../middlewares/role.middleware';
import { Role } from '../../../generated/prisma';

const userRoutes = express.Router();


userRoutes.use(checkRole([Role.ADMIN]));
userRoutes.get('/', getUsers);
userRoutes.post('/', userRegister);

userRoutes.get('/:id', getSingleUser);
userRoutes.patch('/:id', userUpdate);
userRoutes.delete('/:id', userDelete);

export default userRoutes;

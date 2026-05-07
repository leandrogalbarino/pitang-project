import express from 'express';
import {
  getSingleUser,
  getUsers,
  userRegister,
  userDelete,
  userUpdate,
} from '../controllers/users.controller';
import { checkRole } from '../middlewares/role.middleware';
import { Role } from '../../../generated/prisma';

const userRoutes = express.Router();


userRoutes.patch('/:id', userUpdate);
userRoutes.delete('/:id', userDelete);

userRoutes.use(checkRole([Role.ADMIN]));
userRoutes.get('/', getUsers);
userRoutes.post('/', userRegister);
userRoutes.get('/:id', getSingleUser);


export default userRoutes;

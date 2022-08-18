import { Router } from 'express';
import {
  signup,
  deleteAllUser,
  getAllUsers,
  login,
} from '../controllers/userController';
const router = Router();

router.post('/signup', signup);
router.post('/login', login);

router.get('/', getAllUsers);
router.delete('/', deleteAllUser);

export default router;

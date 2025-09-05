import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
} from '../controllers/auth.js';
import { registerUserSchema, loginUserSchema } from '../validation/auth.js';

const router = Router();

router.post('/register', validateBody(registerUserSchema), registerController);
router.post('/login',    validateBody(loginUserSchema),   loginController);
router.post('/refresh',  refreshController);
router.post('/logout',   logoutController);

export default router;

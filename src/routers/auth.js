// src/routers/auth.js
import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
} from '../controllers/auth.js';
import { registerUserSchema, loginUserSchema } from '../validation/auth.js';

const router = Router();

router.post('/register', validateBody(registerUserSchema), ctrlWrapper(registerController));
router.post('/login',    validateBody(loginUserSchema),   ctrlWrapper(loginController));
router.post('/refresh',  ctrlWrapper(refreshController));
router.post('/logout',   ctrlWrapper(logoutController));

export default router;

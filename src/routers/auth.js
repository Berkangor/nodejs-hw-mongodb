import { Router } from 'express';
import { validateBody } from '../middlewares/validateBody.js';
import { ctrlWrapper } from '../middlewares/ctrlWrapper.js';
import {
  registerUserController,
  loginUserController,
  refreshUserController,
  logoutUserController,
  sendResetEmailController,
  resetPwdController,
} from '../controllers/auth.js';
import {
  registerUserSchema,
  loginUserSchema,
  sendResetEmailSchema,
  resetPwdSchema,
} from '../validation/auth.js';

const router = Router();

router.post('/register', validateBody(registerUserSchema), ctrlWrapper(registerUserController));
router.post('/login',    validateBody(loginUserSchema),    ctrlWrapper(loginUserController));

router.post('/refresh',  ctrlWrapper(refreshUserController));
router.post('/logout',   ctrlWrapper(logoutUserController));

router.post('/send-reset-email', validateBody(sendResetEmailSchema), ctrlWrapper(sendResetEmailController));
router.post('/reset-pwd',        validateBody(resetPwdSchema),       ctrlWrapper(resetPwdController));

export default router;

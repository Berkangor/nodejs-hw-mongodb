import { Router } from 'express';
import contactsRouter from './contacts.js';
import authRouter from './auth.js';
import docsRouter from './docs.js';

const router = Router();

router.use('/contacts', contactsRouter);
router.use('/auth', authRouter);
router.use('/api-docs', docsRouter); // <— Swagger UI

router.get('/health', (_req, res) => res.json({ ok: true }));

export default router;

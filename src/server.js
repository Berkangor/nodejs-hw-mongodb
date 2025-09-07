import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import apiRouter from './routers/index.js';
import { notFoundHandler } from '../src/middlewares/notFoundHandler.js';
import { errorHandler } from '../src/middlewares/errorHandler.js';

export const setupServer = () => {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req, res) => res.json({ ok: true }));

  // Tüm rotaları tek yerden bağla
  app.use('/', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

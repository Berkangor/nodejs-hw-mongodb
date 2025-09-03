import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';

import contactsRouter from './routes/contacts.js';          
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

export const setupServer = () => {
  const app = express();

  // Core middlewares
  app.use(express.json());
  app.use(cors());

  // Logger (prod'da pretty kapalı)
  app.use(
    pinoHttp(
      isProd
        ? {}
        : {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true },
            },
          },
    )
  );

  // Health & root
  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
  app.get('/', (_req, res) => res.json({ message: 'Welcome to the Contacts API' }));

  // Routes
  app.use('/contacts', contactsRouter);

  // 404 (Express 5'te '*' kullanma)
  app.use((_req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  // Global error handler (http-errors ile uyumlu)
  app.use(errorHandler);

  // Render uyumu: 0.0.0.0
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ | Server is running on port ${PORT}`);
  });

  return server;
};

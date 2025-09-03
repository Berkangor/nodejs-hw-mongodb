import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';

import contactsRouter from './routes/contacts.js';          
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

export const setupServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

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

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
  app.get('/', (_req, res) => res.json({ message: 'Welcome to the Contacts API' }));

  app.use('/contacts', contactsRouter);

  app.use((_req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.use(errorHandler);

  // Render uyumu: 0.0.0.0
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ | Server is running on port ${PORT}`);
  });

  return server;
};

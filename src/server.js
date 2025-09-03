import express from 'express';
import cors from 'cors';
import { env } from './utils/env.js';

// Controller'lar
import {
  getAllContactsController,
  getContactByIdController,
  createContactController,
  updateContactController,
  deleteContactController,
} from './controllers/contacts.js';

// Global hata yakalayıcı (http-errors ile uyumlu)
import { errorHandler } from './middlewares/errorHandler.js';

const PORT = Number(env('PORT', 3000));

export const setupServer = () => {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cors());

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Root
  app.get('/', (_req, res) => {
    res.json({ message: 'Welcome to the Contacts API' });
  });

  // Contacts routes
  app.get('/contacts', getAllContactsController);
  app.get('/contacts/:contactId', getContactByIdController);
  app.post('/contacts', createContactController);
  app.patch('/contacts/:contactId', updateContactController);
  app.delete('/contacts/:contactId', deleteContactController);

  // 404 handler — (Express 5'te '*' kullanma)
  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  // Global error handler (en sonda)
  app.use(errorHandler);

  // Render uyumu için 0.0.0.0'a bind et
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ | Server is running on port ${PORT}`);
  });

  return server;
};

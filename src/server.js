import express from 'express';
import cors from 'cors';
import { env } from './utils/env.js';

import { getAllContacts, getContactById } from './services/contacts.js';

const PORT = Number(env('PORT', 3000));

export const setupServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  // Health check (opsiyonel ama faydalı)
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Root
  app.get('/', (_req, res) => {
    res.json({ message: 'Welcome to the Contacts API' });
  });

  // GET /contacts
  app.get('/contacts', async (_req, res, next) => {
    try {
      const contacts = await getAllContacts();
      res.status(200).json({
        status: 200,
        message: 'Successfully found contacts!',
        data: contacts,
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /contacts/:contactId
  app.get('/contacts/:contactId', async (req, res, next) => {
    try {
      const { contactId } = req.params;
      const contact = await getContactById(contactId);

      if (!contact) {
        return res.status(404).json({
          status: 404,
          message: 'Contact not found',
        });
      }

      res.status(200).json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
      });
    } catch (error) {
      next(error);
    }
  });

  // 404 handler — Express 5'te '*' kullanma
  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  // Global error handler (en sonda kalmalı)
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal Server Error',
    });
  });

  // Render uyumu için 0.0.0.0'a bind et
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ | Server is running on port ${PORT}`);
  });

  return server;
};

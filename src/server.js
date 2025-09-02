import express from 'express';
import { env } from './utils/env.js';
import cors from 'cors';

import { getAllContacts, getContactById } from './services/contacts.js';

const PORT = env('PORT') || 3000;

export const setupServer = async () => {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Contacts API' });
  });

  app.get('/contacts', async (req, res) => {
    try {
      const contacts = await getAllContacts();
      res.status(200).json({
        status: 200,
        message: 'Successfully found contacts!',
        data: contacts,
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
  });

  app.get('/contacts/:contactId', async (req, res, next) => {
    const { contactId } = req.params;
    try {
      const contact = await getContactById(contactId);
      console.log('Contact found:', contact);
      if (!contact) {
        res.status(404).json({
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
      console.error('Error fetching contact by ID:', error);
    
    }
  });

  app.use('*', (req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.listen(PORT, () => {
    console.log(`✅ | Server is running on port ${PORT}`);
  });
};
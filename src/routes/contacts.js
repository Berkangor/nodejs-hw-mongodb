import express from 'express';
import mongoose from 'mongoose';
import createHttpError from 'http-errors';

import {
  getAllContactsController,
  getContactByIdController,
  createContactController,
  updateContactController,
  deleteContactController,
} from '../controllers/contacts.js';

import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middleware/validateBody.js';
import { isValidId } from '../middleware/isValidId.js';
import { createContactSchema, updateContactSchema } from '../validation/contactsSchemas.js';

const router = express.Router();

// :contactId param kontrolü (geçersiz ObjectId ise 400)
router.param('contactId', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createHttpError(400, 'Invalid contact ID format'));
  }
  next();
});

// CRUD
router.get('/', ctrlWrapper(getAllContactsController));
router.get('/:contactId', isValidId(), ctrlWrapper(getContactByIdController));
router.post('/', validateBody(createContactSchema), ctrlWrapper(createContactController));
router.patch('/:contactId', isValidId(), validateBody(updateContactSchema), ctrlWrapper(updateContactController));
router.delete('/:contactId', isValidId(), ctrlWrapper(deleteContactController));

// (Opsiyonel) 405 Method Not Allowed örneği:
// router.all('/', (_req, res) => res.status(405).json({ message: 'Method Not Allowed' }));

export default router;
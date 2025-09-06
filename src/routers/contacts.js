import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  updateContactController,
  deleteContactController,
} from '../controllers/contacts.js';
import { validateBody } from '../middlewares/validateBody.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import { createContactSchema, updateContactSchema } from '../validation/contactsSchemas.js';

const router = express.Router();

router.use(authenticate); // ← tüm contact rotaları korumalı

router.get('/', ctrlWrapper(getContactsController));
router.get('/:contactId', isValidId(), ctrlWrapper(getContactByIdController));
router.post('/', validateBody(createContactSchema), ctrlWrapper(createContactController));
router.patch('/:contactId', isValidId(), validateBody(updateContactSchema), ctrlWrapper(updateContactController));
router.delete('/:contactId', isValidId(), ctrlWrapper(deleteContactController));

export default router;

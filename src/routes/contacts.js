import express from 'express';
import {
  getContactsController,
  getContactByIdController,
  createContactController,
  updateContactController,
  deleteContactController,
} from '../controllers/contacts.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import mongoose from 'mongoose';
import createError from 'http-errors';

const router = express.Router();
router.param('contactId', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(createError(400, 'Invalid contact ID format'));
  }
  next();
});
router.get('/', ctrlWrapper(getContactsController));
router.get('/:contactId', ctrlWrapper(getContactByIdController));
router.post('/', ctrlWrapper(createContactController));
router.patch('/:contactId', ctrlWrapper(updateContactController));
router.delete('/:contactId', ctrlWrapper(deleteContactController));

export default router;
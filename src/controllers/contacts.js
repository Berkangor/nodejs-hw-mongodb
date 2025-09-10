import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import {
  listContacts,
  getContactById,
  createContact,
  deleteContact,
  upsertContact,
  patchContact,
} from '../services/contacts.js';
import { uploadBufferToCloudinary } from '../services/cloudinary.js';
import {
  createContactSchema,
  updateContactSchema,
} from '../validation/contacts.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);
  const userId = req.user._id;

  const contacts = await listContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
    userId,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await getContactById(contactId, userId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res, next) => {
  // Handle photo upload via Cloudinary
  if (req.file) {
    const url = await uploadBufferToCloudinary(req.file.buffer, `contacts/${req.user._id}`);
    if (url) req.body.photo = url;
  }

  const { error } = createContactSchema.validate(req.body);

  if (error) {
    return next(error);
  }
  const userId = req.user._id;

  const contact = await createContact(req.body, userId);
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contact,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await deleteContact(contactId, userId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
};

export const upsertContactController = async (req, res) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const contact = await upsertContact(contactId, req.body, userId);

  const status = contact ? 200 : 201;
  const message = contact
    ? `Successfully updated contact with id ${contactId}!`
    : `Successfully created a contact with id ${contactId}!`;

  res.status(status).json({
    status: status,
    message: message,
    data: contact,
  });
};

export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const { error } = updateContactSchema.validate(req.body);

  if (error) {
    return next(error);
  }
  const userId = req.user._id;
  const contact = await patchContact(contactId, req.body, userId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully patched contact with id ${contactId}!`,
    data: contact,
  });
};

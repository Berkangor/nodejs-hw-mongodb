import {
  listContacts,         
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseContactFilter } from '../utils/parseContactFilter.js';


import { contactFields } from '../db/models/contact.js';

export const getContactsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query, contactFields);
    const filters = parseContactFilter(req.query);

    const data = await listContacts({ page, perPage, sortBy, sortOrder, ...filters });

    return res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data, 
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /contacts/:contactId
 */
export const getContactByIdController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const data = await getContactById(contactId);

    if (!data) {
      return next(createHttpError(404, 'Contact not found'));
    }

    return res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /contacts
 */
export const createContactController = async (req, res, next) => {
  try {
    const created = await createContact(req.body);

    if (!created) {
      return next(createHttpError(400, 'Contact creation failed'));
    }

    return res.status(201).json({
      status: 201,
      message: 'Contact created successfully!',
      data: created,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * PATCH /contacts/:contactId
 */
export const updateContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const updated = await updateContact(contactId, req.body);

    if (!updated) {
      return next(createHttpError(404, 'Contact not found'));
    }

    return res.status(200).json({
      status: 200,
      message: `Successfully updated contact with id ${contactId}!`,
      data: updated,
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * DELETE /contacts/:contactId
 */
export const deleteContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const deleted = await deleteContact(contactId);

    if (!deleted) {
      return next(createHttpError(404, 'Contact not found'));
    }

    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

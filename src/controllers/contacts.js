import createHttpError from 'http-errors';

import {
  listContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseContactFilter } from '../utils/parseContactFilter.js';
import { contactFields } from '../db/models/contact.js'; // modelden export edilmeli

/**
 * GET /contacts
 * Query: page, perPage, sortBy, sortOrder, type, isFavourite, ...
 * Tüm sonuçlar oturum sahibine (req.user._id) göre filtrelenir.
 */
export const getContactsController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query, contactFields);
    const filters = parseContactFilter(req.query);

    const result = await listContacts({
      page,
      perPage,
      sortBy,
      sortOrder,
      userId: req.user._id,
      ...filters,
    });

    return res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: result, // { data, page, perPage, totalItems, totalPages, hasPreviousPage, hasNextPage }
    });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /contacts/:contactId
 * Yalnızca sahibinin kaydını getirir.
 */
export const getContactByIdController = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const data = await getContactById({
      id: contactId,
      userId: req.user._id,
    });

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
 * Yeni kayıt, otomatik olarak oturum sahibine atanır (userId).
 */
export const createContactController = async (req, res, next) => {
  try {
    const created = await createContact({
      ...req.body,
      userId: req.user._id,
    });

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
 * Sadece sahibinin kaydı güncellenir.
 */
export const updateContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const updated = await updateContact({
      id: contactId,
      userId: req.user._id,
      dto: req.body,
    });

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
 * Sadece sahibinin kaydı silinir.
 */
export const deleteContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;

    const deleted = await deleteContact({
      id: contactId,
      userId: req.user._id,
    });

    if (!deleted) {
      return next(createHttpError(404, 'Contact not found'));
    }

    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
};

import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
} from '../services/contacts.js';
import createHttpError from 'http-errors';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';

export const getAllContactsController = async (req, res, next) => {
  try {
    // const { page, perPage, sortBy, sortOrder } = req.query;
    const { page, perPage } = parsePaginationParams(req.query);
    console.log('Pagination parameters:', { page, perPage });

    const { sortBy, sortOrder } = parseSortParams(req.query);
    console.log('Sort parameters:', { sortBy, sortOrder });

    const filter = parseFilterParams(req.query);
    console.log('Filter parameters:', filter);

    const contacts = await getAllContacts(
      page,
      perPage,
      sortBy,
      sortOrder,
      filter
    );
    res.status(200).json({
      status: 200,
      message: contacts.data.length
        ? 'Successfully found contacts!'
        : 'No contacts found!',
      data: contacts,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ status: 500, message: 'Internal Server Error' });
  }
};

export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await getContactById(contactId);
    console.log('Contact found:', contact);
    if (!contact) {
      next(createHttpError(404, 'Contact not found'));
    }
    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    console.error('Error fetching contact by ID:', error);
    next(error);
  }
};

export const createContactController = async (req, res, next) => {
  const payload = req.body;
  console.log('Payload received for contact creation:', payload);
  try {
    const result = await createContact(payload);
    if (!result) {
      return next(createHttpError(400, 'Contact creation failed'));
    }
    res.status(201).json({
      status: 201,
      message: 'Contact created successfully!',
      data: result,
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    next(error);
  }
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;
  try {
    return res.status(204).json({
      status: 204,
      message: `Successfully deleted contact with id ${contactId}!`,
    });
  } catch (error) {
    console.error('Error deleting contact:', error);
    next(error);
  }
};

export const updateContactController = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const patchContact = await updateContact(contactId, req.body);
    if (!patchContact) {
      next(createHttpError(404, 'Person could not be updated'));
    }
    res.status(200).json({
      status: 200,
      message: `Successfully updated contact with id ${contactId}!`,
      data: patchContact,
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    next(error);
  }
};
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact, // ✅ delete işlemi için service'i ekledik
} from '../services/contacts.js';
import createHttpError from 'http-errors';

/**
 * GET /contacts
 */
export const getAllContactsController = async (_req, res, next) => {
  try {
    const contacts = await getAllContacts();
    return res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    return next(error); // ✅ global error handler'a bırak
  }
};

/**
 * GET /contacts/:contactId
 */
export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const contact = await getContactById(contactId);
    if (!contact) {
      return next(createHttpError(404, 'Contact not found')); // ✅ return
    }

    return res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /contacts
 */
export const createContactController = async (req, res, next) => {
  try {
    const payload = req.body;

    const created = await createContact(payload);
    if (!created) {
      return next(createHttpError(400, 'Contact creation failed'));
    }

    return res.status(201).json({
      status: 201,
      message: 'Contact created successfully!',
      data: created,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /contacts/:contactId
 */
export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const deleted = await deleteContact(contactId);
    if (!deleted) {
      return next(createHttpError(404, 'Contact not found'));
    }

    // 204 No Content: body gönderme
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH/PUT /contacts/:contactId
 */
export const updateContactController = async (req, res, next) => {
  const { contactId } = req.params;

  try {
    const updated = await updateContact(contactId, req.body);
    if (!updated) {
      return next(createHttpError(404, 'Contact not found'));
    }

    return res.status(200).json({
      status: 200,
      message: `Successfully updated contact with id ${contactId}!`,
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

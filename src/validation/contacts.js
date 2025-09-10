import Joi from 'joi';

// POST /contacts (multipart/form-data; body'de photo'yu multer yönetir)
export const createContactSchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().optional(),
});

// PATCH /contacts/:contactId (multipart/form-data)
export const updateContactSchema = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email(),
  phone: Joi.string().trim(),
}).min(1); // en az bir alan zorunlu

// GET /contacts (query)
export const getContactsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('name', 'email', 'createdAt', 'updatedAt').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().allow('', null),
  favorite: Joi.boolean(),
});

// :contactId param doğrulama istersen
export const contactIdParamSchema = Joi.object({
  contactId: Joi.string().length(24).hex().required(),
});

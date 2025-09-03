import joi from 'joi';

export const createContactSchema = joi.object({
  name: joi.string().min(3).max(20).required(),
  phoneNumber: joi.string().min(3).max(20).required(),
  email: joi.string().email().min(3).max(20),
  isFavourite: joi.boolean().optional(),
  contactType: joi.string().valid('personal', 'work', 'home').required(),
});

export const updateContactSchema = joi
  .object({
    name: joi.string().min(3).max(20).optional(),
    phoneNumber: joi.string().min(3).max(20).optional(),
    email: joi.string().email().min(3).max(20).optional(),
    isFavourite: joi.boolean().optional(),
    contactType: joi.string().valid('personal', 'work', 'home').optional(),
  })
  .min(1);
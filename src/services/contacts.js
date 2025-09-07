import Contact from '../db/models/contact.js';

export const listContacts = async ({
  userId,
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  contactType,
  isFavourite,
}) => {
  const filter = { userId }; // ← sadece kendi kayıtları
  if (contactType) filter.contactType = contactType;
  if (typeof isFavourite === 'boolean') filter.isFavourite = isFavourite;

  const totalItems = await Contact.countDocuments(filter);
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / perPage);
  const safePage = totalPages === 0 ? 1 : Math.min(Math.max(Number(page), 1), totalPages);
  const skip = (safePage - 1) * Number(perPage);

  const sortDir = sortOrder === 'desc' ? -1 : 1;
  const data = await Contact.find(filter)
    .sort({ [sortBy]: sortDir })
    .skip(skip)
    .limit(Number(perPage));

  return {
    data,
    page: safePage,
    perPage: Number(perPage),
    totalItems,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: totalPages > 0 && safePage < totalPages,
  };
};

export const getContactById = async (contactId, userId) => {
  return Contact.findOne({ _id: contactId, userId });
};

export const createContact = async (payload, userId) => {
  const doc = new Contact({ ...payload, userId });
  return doc.save();
};

export const updateContact = async (contactId, payload, userId) => {
  return Contact.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    { new: true, runValidators: true }
  );
};

export const deleteContact = async (contactId, userId) => {
  const res = await Contact.deleteOne({ _id: contactId, userId });
  return res.deletedCount > 0;
};

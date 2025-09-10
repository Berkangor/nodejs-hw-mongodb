import { Contact } from '../db/models/contact.js'; // <- named import!

const ALLOWED_SORT_FIELDS = new Set(['name', 'email', 'createdAt', 'updatedAt']);

export const listContacts = async ({
  userId,
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  contactType,
  isFavourite,
}) => {
  // NOT: Şemanız 'owner' alanı kullanıyorsa burayı { owner: userId } yapın.
  const filter = { userId };

  if (contactType) filter.contactType = contactType;
  if (typeof isFavourite === 'boolean') filter.isFavourite = isFavourite;

  const totalItems = await Contact.countDocuments(filter);
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / perPage);

  const numericPage = Number(page) || 1;
  const numericPerPage = Math.max(1, Number(perPage) || 10);

  const safePage = totalPages === 0 ? 1 : Math.min(Math.max(numericPage, 1), totalPages);
  const skip = (safePage - 1) * numericPerPage;

  const safeSortBy = ALLOWED_SORT_FIELDS.has(String(sortBy)) ? String(sortBy) : 'name';
  const sortDir = String(sortOrder).toLowerCase() === 'desc' ? -1 : 1;

  const data = await Contact.find(filter)
    .sort({ [safeSortBy]: sortDir })
    .skip(skip)
    .limit(numericPerPage);

  return {
    data,
    page: safePage,
    perPage: numericPerPage,
    totalItems,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: totalPages > 0 && safePage < totalPages,
  };
};

export const getContactById = async (contactId, userId) => {
  // NOT: Şemanız 'owner' alanı kullanıyorsa { _id: contactId, owner: userId }
  return Contact.findOne({ _id: contactId, userId });
};

export const createContact = async (payload, userId) => {
  // NOT: Şemanız 'owner' alanı kullanıyorsa { ...payload, owner: userId }
  const doc = new Contact({ ...payload, userId });
  return doc.save();
};

export const updateContact = async (contactId, payload, userId) => {
  // NOT: Şemanız 'owner' alanı kullanıyorsa { _id: contactId, owner: userId }
  return Contact.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    { new: true, runValidators: true },
  );
};

export const deleteContact = async (contactId, userId) => {
  // NOT: Şemanız 'owner' alanı kullanıyorsa { _id: contactId, owner: userId }
  const res = await Contact.deleteOne({ _id: contactId, userId });
  return res.deletedCount > 0;
};
export { updateContact as patchContact };

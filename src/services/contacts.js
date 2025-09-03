import Contact from '../db/models/contacts.js';


export const listContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  contactType,          
  isFavourite,          
}) => {
  const filter = {};
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


export const getAllContacts = async () => {
  return await Contact.find();
};


export const getContactById = async (id) => {
  return await Contact.findById(id);
};


export const createContact = async (payload) => {
  const doc = new Contact(payload);
  return await doc.save();
};


export const updateContact = async (id, payload) => {
  return await Contact.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
};


export const deleteContact = async (id) => {
  const result = await Contact.findByIdAndDelete(id);
  return !!result;
};

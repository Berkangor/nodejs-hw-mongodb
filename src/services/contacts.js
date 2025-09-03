import ContactsCollection from '../db/models/contacts.js';
import { calcPaginationData } from '../utils/calcPaginationData.js';

export const getContacts = async ({
  page = 1,
  perPage = 10,
  sortBy,
  sortOrder = 'asc',
  filters = {},
}) => {
  const skip = (page - 1) * perPage;
  const query = ContactsCollection.find(filters);

  if (filters.contactType) {
    query.where('contactType').equals(filters.contactType);
  }
  if (filters.isFavourite) {
    query.where('isFavourite').equals(filters.isFavourite);
  }

  const data = await query
    .skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder });

  const totalItems = await ContactsCollection.countDocuments(filters);

  const paginationData = calcPaginationData({ page, perPage, totalItems });

  return {
    ...paginationData,
    data,
  };
};

export const getContactById = async (id) => ContactsCollection.findById(id);

export const addContact = async (payload) => ContactsCollection.create(payload);

//---------------------------------------------------------------

export const patchContactById = async (_id, payload) => {
  const result = await ContactsCollection.findOneAndUpdate({ _id }, payload, {
    new: true,
    includeResultMetadata: true,
  });

  return result;
};

//---------------------------------------------------------------

export const deleteContactById = (id) =>
  ContactsCollection.findByIdAndDelete(id);
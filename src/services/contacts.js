import Contact from '../db/models/contact.js';

export const listContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  userId,
  ...filters // parseContactFilter: { contactType, isFavourite } vb.
}) => {
  const filter = { userId, ...filters };

  const totalItems = await Contact.countDocuments(filter);

  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / Number(perPage || 10));

  const safePage = totalPages === 0
    ? 1
    : Math.min(Math.max(Number(page) || 1, 1), totalPages);

  const limit = Number(perPage) || 10;
  const skip = (safePage - 1) * limit;

  const sortDir = sortOrder === 'desc' ? -1 : 1;

  const data = await Contact.find(filter)
    .sort({ [sortBy]: sortDir })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    data,
    page: safePage,
    perPage: limit,
    totalItems,
    totalPages,
    hasPreviousPage: safePage > 1,
    hasNextPage: totalPages > 0 && safePage < totalPages,
  };
};

export const getAllContacts = async ({ userId }) => {
  return Contact.find({ userId }).lean();
};

export const getContactById = async ({ id, userId }) => {
  return Contact.findOne({ _id: id, userId }).lean();
};

export const createContact = async (dto) => {
  // controller: { ...req.body, userId: req.user._id } gönderiyor
  const doc = await Contact.create(dto);
  return doc.toObject();
};

export const updateContact = async ({ id, userId, dto }) => {
  return Contact.findOneAndUpdate(
    { _id: id, userId },
    dto,
    { new: true, runValidators: true }
  ).lean();
};

export const deleteContact = async ({ id, userId }) => {
  const res = await Contact.deleteOne({ _id: id, userId });
  return res.deletedCount > 0;
};

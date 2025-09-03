const sortOrderList = ['asc', 'desc'];

export const parseSortParams = ({ sortBy, sortOrder }, contactFields) => {
  const parsedSortOrder = sortOrderList.includes(sortOrder)
    ? sortOrder
    : sortOrderList[0];

  const parseSortedBy = contactFields.includes(sortBy) ? sortBy : '_id';

  return {
    sortOrder: parsedSortOrder,
    sortBy: parseSortedBy,
  };
};
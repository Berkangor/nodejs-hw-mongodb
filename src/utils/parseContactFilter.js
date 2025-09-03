
export const parseContactFilter = ({ type, isFavourite }) => {
  const filters = {};

  if (typeof type === 'string') filters.contactType = type;
  if (typeof isFavourite !== 'undefined') filters.isFavourite = isFavourite;

  return filters;
};

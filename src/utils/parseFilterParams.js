
const escapeRegExp = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Sayfalama + sıralama + filtre üretir
export const parseFilterParams = (query = {}) => {
  // --- pagination
  const pageNum = Number.parseInt(query.page, 10);
  const limitNum = Number.parseInt(query.limit, 10);

  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
  let limit = Number.isFinite(limitNum) && limitNum > 0 ? limitNum : 10;
  if (limit > 100) limit = 100;
  const skip = (page - 1) * limit;

  // --- sort (belli alanlarla sınırla)
  const allowedSort = new Set(['name', 'email', 'createdAt', 'updatedAt']);
  const sortByRaw = query.sortBy || 'createdAt';
  const sortBy = allowedSort.has(sortByRaw) ? sortByRaw : 'createdAt';
  const sortOrder = String(query.sortOrder).toLowerCase() === 'asc' ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  // --- filters
  const filter = {};

  // Tek tek alan bazlı filtreler (case-insensitive)
  if (query.name)  filter.name  = { $regex: escapeRegExp(query.name),  $options: 'i' };
  if (query.email) filter.email = { $regex: escapeRegExp(query.email), $options: 'i' };
  if (query.phone) filter.phone = { $regex: escapeRegExp(query.phone), $options: 'i' };

  // Boolean olabilecek örnek alan
  if (typeof query.favorite !== 'undefined') {
    const v = String(query.favorite).toLowerCase();
    if (['true', '1', 'yes'].includes(v))  filter.favorite = true;
    if (['false', '0', 'no'].includes(v))  filter.favorite = false;
  }

  // Serbest metin araması (name/email/phone üzerinde)
  if (query.search) {
    const rx = new RegExp(escapeRegExp(query.search), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
  }

  return {
    filter,
    options: { skip, limit, sort },
    pagination: { page, limit },
  };
};

export default parseFilterParams;

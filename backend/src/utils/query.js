const mongoose = require('mongoose');

const toObjectId = (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
  return null;
};

const paginate = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  pages: total === 0 ? 0 : Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

const parseSalary = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
};

const parseArray = (value) => {
  if (!value) return undefined;
  const arr = Array.isArray(value) ? value : String(value).split(',');
  return arr.map((v) => String(v).trim()).filter(Boolean);
};

const parseBool = (value) => {
  if (value === undefined || value === null) return undefined;
  return ['true', '1', 'yes'].includes(String(value).toLowerCase());
};

module.exports = { toObjectId, paginate, buildPagination, parseSalary, parseArray, parseBool };

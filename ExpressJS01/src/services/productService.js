const Product = require('../models/product');
const Category = require('../models/category');
const mongoose = require('mongoose');
const esClient = require('../config/elasticsearch');
/**
 * Helper: ensure category exists.
 * Accepts either categoryId (ObjectId string) or a name string.
 * Returns category document.
 */
const ensureCategory = async (categoryInput) => {
  if (!categoryInput) return null;

  // if looks like ObjectId, try findById
  if (mongoose.Types.ObjectId.isValid(categoryInput)) {
    const cat = await Category.findById(categoryInput);
    if (cat) return cat;
  }

  // otherwise treat as name (or slug)
  const name = String(categoryInput).trim();
  const slug = name.toLowerCase().replace(/\s+/g, '-');

  let cat = await Category.findOne({ $or: [{ name }, { slug }] });
  if (!cat) {
    cat = await Category.create({ name, slug });
  }
  return cat;
};

const createProductService = async (payload) => {
  try {
    const p = { ...payload };

    // if payload.category provided (id or name), ensure category doc
    if (p.category) {
      const cat = await ensureCategory(p.category);
      if (cat) p.category = cat._id;
    }

    const doc = await Product.create(p);
    const populated = await Product.findById(doc._id).populate('category').lean();
    return { EC: 0, EM: 'Product created', DT: populated };
  } catch (error) {
    console.error('[createProductService]', error);
    return { EC: -1, EM: 'Server error', DT: null };
  }
};

const getProductsByCategory = async (category, page = 1, limit = 10) => {
  try {
    const q = {};
    if (category && category !== 'all') {
      if (mongoose.Types.ObjectId.isValid(category)) {
        q.category = category;
      } else {
        const cat = await Category.findOne({ $or: [{ name: category }, { slug: category }] });
        if (cat) q.category = cat._id;
        else {
          return { EC: 0, EM: 'OK', DT: { items: [], page: Number(page), limit: Number(limit), total: 0, hasMore: false } };
        }
      }
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Product.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('category').lean(),
      Product.countDocuments(q)
    ]);

    const hasMore = skip + items.length < total;

    // 🚀 Thêm delay 3 giây
    await new Promise(resolve => setTimeout(resolve, 500));

    return { EC: 0, EM: 'OK', DT: { items, page: Number(page), limit: Number(limit), total, hasMore } };
  } catch (error) {
    console.error('[getProductsByCategory]', error);
    return { EC: -1, EM: 'Server error', DT: null };
  }
};

const searchProductsService = async ({ keyword = '', category, minPrice, maxPrice, page = 1, limit = 10 }) => {
  try {
    const must = [];
    const filter = [];

    if (keyword) {
      must.push({
        bool: {
          should: [
            {
              multi_match: {
                query: keyword,
                fields: ['title^3', 'description'],
                fuzziness: 'AUTO'
              }
            },
            {
              wildcard: {
                title: `${keyword.toLowerCase()}*`
              }
            }
          ]
        }
      });
    }

    if (category && category !== 'all') {
      filter.push({ term: { 'category.keyword': category } });
    }

    if (minPrice || maxPrice) {
      const range = {};
      if (minPrice) range.gte = Number(minPrice);
      if (maxPrice) range.lte = Number(maxPrice);
      filter.push({ range: { price: range } });
    }

    const from = (Math.max(1, Number(page)) - 1) * Number(limit);

    const result = await esClient.search({
      index: 'products',
      from,
      size: Number(limit),
      query: {
        bool: { must, filter }
      }
    });

    const items = result.hits.hits.map(hit => ({
      id: hit._id,
      ...hit._source
    }));

    const total = result.hits.total.value;
    const hasMore = from + items.length < total;

    return { EC: 0, EM: 'OK', DT: { items, page: Number(page), limit: Number(limit), total, hasMore } };
  } catch (error) {
    console.error('[searchProductsService]', error);
    return { EC: -1, EM: 'Search error', DT: null };
  }
};


module.exports = {
  createProductService,
  getProductsByCategory,
  searchProductsService
};
const {
  createProductService,
  getProductsByCategory
} = require('../services/productService');
const { searchProductsService } = require('../services/productService');

/**
 * POST /v1/api/products
 * body: { title, description, category, price, image }
 */
const createProduct = async (req, res) => {
  try {
    const payload = req.body;
    const data = await createProductService(payload);
    if (!data) return res.status(500).json({ EC: -1, EM: 'Unexpected service response', DT: null });

    if (data.EC === 0) return res.status(201).json(data);
    return res.status(400).json(data);
  } catch (error) {
    console.error('[productController.createProduct] ', error);
    return res.status(500).json({ EC: -1, EM: 'Server error', DT: null });
  }
};

const listProducts = async (req, res) => {
  try {
    const { category = 'all', page = 1, limit = 10 } = req.query;
    const data = await getProductsByCategory(category, page, limit);
    if (!data) return res.status(500).json({ EC: -1, EM: 'Unexpected service response', DT: null });

    if (data.EC === 0) return res.status(200).json(data);
    return res.status(500).json(data);
  } catch (error) {
    console.error('[productController.listProducts] ', error);
    return res.status(500).json({ EC: -1, EM: 'Server error', DT: null });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    const data = await searchProductsService({ keyword, category, minPrice, maxPrice, page, limit });
    if (!data) return res.status(500).json({ EC: -1, EM: 'Unexpected service response', DT: null });

    if (data.EC === 0) return res.status(200).json(data);
    return res.status(500).json(data);
  } catch (error) {
    console.error('[productController.searchProducts] ', error);
    return res.status(500).json({ EC: -1, EM: 'Server error', DT: null });
  }
};

module.exports = {
  createProduct,
  listProducts,
  searchProducts
};
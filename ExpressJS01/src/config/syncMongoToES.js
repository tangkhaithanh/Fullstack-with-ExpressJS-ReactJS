require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');   // model Product
const Category = require('../models/category'); // model Category
const esClient = require('./elasticsearch');

(async () => {
  try {
    // 1. Kết nối Mongo (DB recruitment)
    const uri = process.env.MONGODB_URL || 'mongodb://localhost:27017/recruitment';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected:', uri);

    // 2. Lấy toàn bộ sản phẩm
    const products = await Product.find().populate('category').lean();
    console.log(`📦 Tìm thấy ${products.length} sản phẩm trong MongoDB`);

    if (!products.length) {
      console.log('⚠️ Không có sản phẩm nào để import');
      process.exit(0);
    }

    // 3. Chuẩn bị body cho bulk API
    const body = products.flatMap(doc => [
      { index: { _index: 'products', _id: String(doc._id) } },
      {
        title: doc.title,
        description: doc.description,
        price: doc.price,
        image: doc.image,
        category: doc.category?.name || '',
        createdAt: doc.createdAt
      }
    ]);

    // 4. Gửi bulk request lên Elasticsearch
    const response = await esClient.bulk({ refresh: true, body });

    if (response.errors) {
      console.error('❌ Có lỗi khi bulk index:');
      response.items.forEach((item, i) => {
        if (item.index && item.index.error) {
          console.error(`  -> Document ${products[i]._id}:`, item.index.error);
        }
      });
    } else {
      console.log(`✅ Đã import ${products.length} sản phẩm vào Elasticsearch`);
    }

    process.exit(0);
  } catch (err) {
    console.error('🔥 Lỗi khi sync:', err);
    process.exit(1);
  }
})();

const mongoose = require('mongoose');
const connectDatabase = require('./src/config/database.js'); // đường dẫn tới file bạn gửi
const Category = require('./src/models/category'); // sửa path theo cấu trúc project
const Product = require('./src/models/product');

async function seed() {
  try {
    // 1. Kết nối DB
    await connectDatabase();

    // 2. Xoá dữ liệu cũ
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️ Đã xoá dữ liệu cũ');

    // 3. Tạo categories mẫu
    const categories = await Category.insertMany([
      { name: 'Điện thoại', slug: 'dien-thoai', description: 'Các loại điện thoại' },
      { name: 'Laptop', slug: 'laptop', description: 'Máy tính xách tay' },
      { name: 'Phụ kiện', slug: 'phu-kien', description: 'Phụ kiện đi kèm' }
    ]);
    console.log('📂 Đã tạo categories mẫu');

    // 4. Tạo products mẫu
    await Product.insertMany([
      {
        title: 'iPhone 15',
        description: 'Điện thoại mới nhất của Apple',
        price: 30000,
        category: categories[0]._id,
        image: 'https://via.placeholder.com/150'
      },
      {
        title: 'MacBook Pro 16"',
        description: 'Laptop mạnh mẽ cho dân dev',
        price: 60000,
        category: categories[1]._id,
        image: 'https://via.placeholder.com/150'
      },
      {
        title: 'Tai nghe Bluetooth',
        description: 'Phụ kiện âm thanh tiện lợi',
        price: 500,
        category: categories[2]._id,
        image: 'https://via.placeholder.com/150'
      }
    ]);
    console.log('📦 Đã tạo products mẫu');

    console.log('🎉 Seeding hoàn tất!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi khi seed dữ liệu:', err);
    process.exit(1);
  }
}

seed();
